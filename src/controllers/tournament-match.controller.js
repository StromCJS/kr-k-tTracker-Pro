import { Tournament } from "../models/tournament.model.js";

// Helper function to generate league fixtures (round-robin style)
const generateFixtures = (teams) => {
    const matches = [];
    const numTeams = teams.length;

    // For a round-robin tournament, each team plays every other team once
    for (let i = 0; i < numTeams; i++) {
        for (let j = i + 1; j < numTeams; j++) {
            matches.push({
                teams: [teams[i], teams[j]],
                date: new Date(), // Default date (should be updated by admin)
                time: "00:00",    // Default time (should be updated by admin)
                venue: "TBD",     // Default venue (should be updated by admin)
                scorers: [],
                managers: [],
            });
        }
    }
    return matches;
};

export const createTournament = async (req, res) => {
    try {
        const { name, type, teams } = req.body;

        if (!name || !type || !teams || !Array.isArray(teams) || teams.length < 2) {
            return res.status(400).json({
                message: "Invalid input: name, type, and at least 2 teams are required"
            });
        }

        const tournament = new Tournament({
            name,
            type,
            teams,
        });

        await tournament.save();
        res.status(201).json({ message: "Tournament created successfully", tournament });
    } catch (error) {
        res.status(500).json({ message: "Error creating tournament", error: error.message });
    }
};

export const updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, teams } = req.body;

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (name) tournament.name = name;
        if (type) tournament.type = type;
        if (teams && Array.isArray(teams) && teams.length >= 2) tournament.teams = teams;

        tournament.updatedAt = Date.now();
        await tournament.save();
        res.status(200).json({ message: "Tournament updated successfully", tournament });
    } catch (error) {
        res.status(500).json({ message: "Error updating tournament", error: error.message });
    }
};

export const getTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().lean();
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tournaments", error: error.message });
    }
};

export const createMatch = async (req, res) => {
    try {
        const { tournamentId, teams, date, time, venue, scorers, managers } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (!teams || teams.length !== 2 ||
            !tournament.teams.includes(teams[0]) ||
            !tournament.teams.includes(teams[1])) {
            return res.status(400).json({
                message: "Invalid teams: must include exactly 2 teams from the tournament"
            });
        }

        // Check for scheduling conflict
        const conflict = tournament.matches.some(match =>
            match.date.toISOString() === new Date(date).toISOString() &&
            match.time === time &&
            match.teams.some(team => teams.includes(team))
        );
        if (conflict) {
            return res.status(400).json({
                message: "Scheduling conflict: one or both teams already have a match at this date and time"
            });
        }

        const newMatch = {
            teams,
            date: new Date(date),
            time,
            venue,
            scorers: scorers || [],
            managers: managers || [],
        };

        tournament.matches.push(newMatch);
        await tournament.save();
        res.status(201).json({ message: "Match created successfully", match: newMatch });
    } catch (error) {
        res.status(500).json({ message: "Error creating match", error: error.message });
    }
};

export const updateMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { teams, date, time, venue, scorers, managers, status, result, tournamentId } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const match = tournament.matches.id(matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        // Check for scheduling conflict when updating date/time/teams
        if (date || time || teams) {
            const newTeams = teams || match.teams;
            const newDate = date ? new Date(date) : match.date;
            const newTime = time || match.time;

            const conflict = tournament.matches.some(m =>
                m._id.toString() !== matchId &&
                m.date.toISOString() === newDate.toISOString() &&
                m.time === newTime &&
                m.teams.some(team => newTeams.includes(team))
            );
            if (conflict) {
                return res.status(400).json({
                    message: "Scheduling conflict: one or both teams already have a match at this date and time"
                });
            }
        }

        if (teams && teams.length === 2) match.teams = teams;
        if (date) match.date = new Date(date);
        if (time) match.time = time;
        if (venue) match.venue = venue;
        if (scorers) match.scorers = scorers;
        if (managers) match.managers = managers;
        if (status) match.status = status;
        if (result) match.result = result;

        await tournament.save();
        res.status(200).json({ message: "Match updated successfully", match });
    } catch (error) {
        res.status(500).json({ message: "Error updating match", error: error.message });
    }
};

export const getMatches = async (req, res) => {
    try {
        const { tournamentId } = req.query;

        if (tournamentId) {
            const tournament = await Tournament.findById(tournamentId);
            if (!tournament) {
                return res.status(404).json({ message: "Tournament not found" });
            }
            res.status(200).json(tournament.matches);
        } else {
            const tournaments = await Tournament.find();
            const allMatches = tournaments.flatMap((tournament) => tournament.matches);
            res.status(200).json(allMatches);
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching matches", error: error.message });
    }
};

export const generateFixturesForTournament = async (req, res) => {
    try {
        const { id } = req.params;

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (tournament.matches.length > 0) {
            return res.status(400).json({ message: "Fixtures already generated for this tournament" });
        }

        const fixtures = generateFixtures(tournament.teams);
        tournament.matches = fixtures;
        await tournament.save();

        res.status(200).json({ message: "Fixtures generated successfully", matches: tournament.matches });
    } catch (error) {
        res.status(500).json({ message: "Error generating fixtures", error: error.message });
    }
};