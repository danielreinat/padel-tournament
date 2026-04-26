from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ortools.sat.python import cp_model
from itertools import combinations
import math

app = FastAPI(title="Padel Tournament Optimizer")


class Team(BaseModel):
    id: str
    avg_level: float


class GenerateGroupsRequest(BaseModel):
    teams: list[Team]
    num_groups: int


class GroupAssignment(BaseModel):
    group_index: int
    group_name: str
    team_ids: list[str]
    avg_level: float


class GenerateGroupsResponse(BaseModel):
    groups: list[GroupAssignment]
    level_spread: float  # difference between highest and lowest group avg


class MatchSlot(BaseModel):
    home_team_id: str
    away_team_id: str
    group_index: int
    court_index: int
    round_number: int


class GenerateScheduleRequest(BaseModel):
    groups: list[GroupAssignment]
    num_courts: int


class GenerateScheduleResponse(BaseModel):
    matches: list[MatchSlot]
    total_rounds: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate-groups", response_model=GenerateGroupsResponse)
def generate_groups(req: GenerateGroupsRequest):
    teams = req.teams
    num_groups = req.num_groups
    n = len(teams)

    if n < num_groups * 2:
        raise HTTPException(400, f"Need at least {num_groups * 2} teams for {num_groups} groups")

    if num_groups < 2:
        raise HTTPException(400, "Need at least 2 groups")

    # Target sizes: distribute teams as evenly as possible
    base_size = n // num_groups
    extra = n % num_groups  # first 'extra' groups get base_size + 1

    # Scale levels to integers for CP-SAT (multiply by 100)
    scaled_levels = [int(t.avg_level * 100) for t in teams]

    model = cp_model.CpModel()

    # Binary variable: assign[i][g] = 1 if team i is in group g
    assign = {}
    for i in range(n):
        for g in range(num_groups):
            assign[i, g] = model.new_bool_var(f"assign_{i}_{g}")

    # Each team in exactly one group
    for i in range(n):
        model.add_exactly_one(assign[i, g] for g in range(num_groups))

    # Group sizes
    for g in range(num_groups):
        target = base_size + (1 if g < extra else 0)
        model.add(sum(assign[i, g] for i in range(n)) == target)

    # Track group level sums
    group_sums = []
    for g in range(num_groups):
        s = model.new_int_var(0, sum(scaled_levels), f"sum_{g}")
        model.add(s == sum(assign[i, g] * scaled_levels[i] for i in range(n)))
        group_sums.append(s)

    # Minimize the difference between max and min group sum
    # Normalize by group size for fair comparison
    max_sum = model.new_int_var(0, sum(scaled_levels), "max_sum")
    min_sum = model.new_int_var(0, sum(scaled_levels), "min_sum")
    model.add_max_equality(max_sum, group_sums)
    model.add_min_equality(min_sum, group_sums)

    diff = model.new_int_var(0, sum(scaled_levels), "diff")
    model.add(diff == max_sum - min_sum)
    model.minimize(diff)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    status = solver.solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise HTTPException(500, "Could not find a valid group assignment")

    # Extract assignments
    group_names = [chr(65 + g) for g in range(num_groups)]  # A, B, C...
    groups: list[GroupAssignment] = []

    for g in range(num_groups):
        team_ids = []
        level_sum = 0.0
        count = 0
        for i in range(n):
            if solver.value(assign[i, g]):
                team_ids.append(teams[i].id)
                level_sum += teams[i].avg_level
                count += 1
        avg = level_sum / count if count > 0 else 0
        groups.append(GroupAssignment(
            group_index=g,
            group_name=group_names[g],
            team_ids=team_ids,
            avg_level=round(avg, 2),
        ))

    max_avg = max(gr.avg_level for gr in groups)
    min_avg = min(gr.avg_level for gr in groups)

    return GenerateGroupsResponse(
        groups=groups,
        level_spread=round(max_avg - min_avg, 2),
    )


@app.post("/generate-schedule", response_model=GenerateScheduleResponse)
def generate_schedule(req: GenerateScheduleRequest):
    """Generate round-robin matches for each group and assign to courts/rounds."""
    num_courts = req.num_courts
    if num_courts < 1:
        raise HTTPException(400, "Need at least 1 court")

    # Generate all matches (round-robin within each group)
    all_matches: list[dict] = []
    for group in req.groups:
        team_ids = group.team_ids
        for home, away in combinations(team_ids, 2):
            all_matches.append({
                "home_team_id": home,
                "away_team_id": away,
                "group_index": group.group_index,
            })

    if not all_matches:
        return GenerateScheduleResponse(matches=[], total_rounds=0)

    num_matches = len(all_matches)

    # Collect all team IDs
    all_team_ids = set()
    for m in all_matches:
        all_team_ids.add(m["home_team_id"])
        all_team_ids.add(m["away_team_id"])

    # Estimate rounds needed
    max_rounds = num_matches  # worst case: one match per round
    min_rounds = math.ceil(num_matches / num_courts)

    model = cp_model.CpModel()

    # Variables: which round is each match in, which court
    match_round = [model.new_int_var(0, max_rounds - 1, f"round_{m}") for m in range(num_matches)]
    match_court = [model.new_int_var(0, num_courts - 1, f"court_{m}") for m in range(num_matches)]

    # No two matches on the same court in the same round
    for i in range(num_matches):
        for j in range(i + 1, num_matches):
            # If same round, must be different court
            same_round = model.new_bool_var(f"sr_{i}_{j}")
            model.add(match_round[i] == match_round[j]).only_enforce_if(same_round)
            model.add(match_round[i] != match_round[j]).only_enforce_if(same_round.negated())
            model.add(match_court[i] != match_court[j]).only_enforce_if(same_round)

    # No team plays two matches in the same round
    for i in range(num_matches):
        for j in range(i + 1, num_matches):
            teams_i = {all_matches[i]["home_team_id"], all_matches[i]["away_team_id"]}
            teams_j = {all_matches[j]["home_team_id"], all_matches[j]["away_team_id"]}
            if teams_i & teams_j:  # teams overlap
                model.add(match_round[i] != match_round[j])

    # Minimize total rounds used
    total_rounds = model.new_int_var(min_rounds, max_rounds, "total_rounds")
    for m in range(num_matches):
        model.add(match_round[m] < total_rounds)
    model.minimize(total_rounds)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 15.0
    status = solver.solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        # Fallback: simple sequential assignment
        result_matches = []
        round_num = 0
        court_num = 0
        used_teams_in_round: set[str] = set()
        for m_data in all_matches:
            teams = {m_data["home_team_id"], m_data["away_team_id"]}
            if teams & used_teams_in_round or court_num >= num_courts:
                round_num += 1
                court_num = 0
                used_teams_in_round = set()
            result_matches.append(MatchSlot(
                home_team_id=m_data["home_team_id"],
                away_team_id=m_data["away_team_id"],
                group_index=m_data["group_index"],
                court_index=court_num,
                round_number=round_num,
            ))
            used_teams_in_round |= teams
            court_num += 1
        return GenerateScheduleResponse(
            matches=result_matches,
            total_rounds=round_num + 1,
        )

    # Extract solution
    result_matches = []
    for m in range(num_matches):
        result_matches.append(MatchSlot(
            home_team_id=all_matches[m]["home_team_id"],
            away_team_id=all_matches[m]["away_team_id"],
            group_index=all_matches[m]["group_index"],
            court_index=solver.value(match_court[m]),
            round_number=solver.value(match_round[m]),
        ))

    result_matches.sort(key=lambda x: (x.round_number, x.court_index))

    return GenerateScheduleResponse(
        matches=result_matches,
        total_rounds=solver.value(total_rounds),
    )
