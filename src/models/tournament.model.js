import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    teams: [{ type: String, required: true }],
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    scorers: [{ type: String }],
    managers: [{ type: String }],
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled"
    },
    result: { type: String },
});

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ["league", "knockout", "custom"],
        required: true
    },
    teams: [{ type: String, required: true }],
    matches: [matchSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Tournament = mongoose.model("Tournament", tournamentSchema);