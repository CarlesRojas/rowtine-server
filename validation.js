const Joi = require("joi");

const setRowEntryValidation = (data) => {
    const schema = Joi.object({
        date: Joi.date().required(),
        timezoneOffsetInMs: Joi.number().required(),
        value: Joi.boolean().required(),
    });

    return schema.validate(data);
};

const getMonthEntries = (data) => {
    const schema = Joi.object({
        month: Joi.number().min(0).max(12).required(),
        year: Joi.number().min(2020).required(),
    });

    return schema.validate(data);
};

module.exports.setRowEntryValidation = setRowEntryValidation;
module.exports.getMonthEntries = getMonthEntries;
