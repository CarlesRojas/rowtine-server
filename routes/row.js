// Get express Router
const router = require("express").Router();

// Dot env constants
const dotenv = require("dotenv");
dotenv.config();

// Get the Validation schemas
const { setRowEntryValidation, getMonthEntries } = require("../validation");

// Get the schemes
const RowEntry = require("../models/RowEntry");

router.post("/setRowEntry", async (request, response) => {
    // Validate data
    const { error } = setRowEntryValidation(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        // Deconstruct request
        const { date, timezoneOffsetInMs, value } = request.body;

        // Get local date of the user
        const localDate = new Date(date);
        localDate.setTime(localDate.getTime() + timezoneOffsetInMs);
        const day = localDate.getUTCDate();
        const month = localDate.getUTCMonth() + 1;
        const year = localDate.getUTCFullYear();

        const entries = await RowEntry.aggregate([
            {
                $addFields: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    day: { $dayOfMonth: "$date" },
                },
            },
            { $match: { year, month, day } },
        ]);

        // Create row entry
        if (value) {
            if (entries.length > 0) return response.status(409).json({ error: "You already rowed on this date." });

            // Create entry for health
            const rowEntry = new RowEntry({
                date: localDate,
            });

            // Save user to DB
            await rowEntry.save();

            response.status(200).json({ success: true });
        }

        // Remove row entry
        else {
            if (entries.length <= 0) return response.status(409).json({ error: "You did not row on this date." });

            entries.forEach(async (entry) => {
                await RowEntry.deleteOne({ _id: entry._id });
            });

            response.status(200).json({ success: true });
        }
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

router.post("/getMonthEntries", async (request, response) => {
    // Validate data
    const { error } = getMonthEntries(request.body);

    // If there is a validation error
    if (error) return response.status(422).json({ error: error.details[0].message });

    try {
        // Deconstruct request
        const { month, year } = request.body;

        const entries = await RowEntry.aggregate([
            {
                $addFields: {
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                },
            },
            { $match: { month, year } },
            { $sort: { date: 1 } },
        ]);

        // Treat data
        var responseArray = [];
        const numDaysInMonth = new Date(year, month, 0).getDate();
        var entriesIndex = 0;
        for (let i = 0; i < numDaysInMonth; i++) {
            if (entriesIndex >= entries.length) {
                responseArray.push(false);
                continue;
            }

            // Get current entry
            const { date } = entries[entriesIndex];

            // Get day of the entry
            const entryDate = new Date(date);
            const entryDay = entryDate.getUTCDate();

            // If entry matches this day -> Push info and go to next entry
            if (entryDay === i + 1) {
                responseArray.push(true);
                entriesIndex++;
            }

            // Otherwise -> Push null and go to the next day
            else responseArray.push(false);
        }

        response.status(200).json({ historic: responseArray });
    } catch (error) {
        // Return error
        response.status(500).json({ error });
    }
});

module.exports = router;
