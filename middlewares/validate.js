const CONSTANTS = require('../constants/constants');
const {getBody} = require('../utils/getBody');
const validate = (schema) => (req, res, next) => {

  // schema options
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  //from where to get the data
  const body = getBody(req); 

  //validate the data
  const {
    error,
    value
  } = schema.validate(body, options);
  if (error) {
    const errorArr = [];
    for (const detail of error.details) {
      const tempObj = {
        [detail.path[0]]: detail.message
      };
      errorArr.push(tempObj);
    }

    return res.status(422).send({
      success: false,
      errors: errorArr,
      message: CONSTANTS.MESSAGES.VALIDATION_ERRORS
    });
  }
  Object.assign(req.body, value);    
  next();  
}

module.exports = validate;
