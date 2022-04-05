const Joi = require("joi");

const setRowEntryValidation = (data) => {
    const schema = Joi.object({
        date: Joi.date().required(),
        timezoneOffsetInMs: Joi.number().required(),
        value: Joi.boolean().required(),
    });

    return schema.validate(data);
};

module.exports.setRowEntryValidation = setRowEntryValidation;
