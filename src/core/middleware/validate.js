export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { stripUnknown: true, abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        status: 422,
        title: detail.message,
        source: { pointer: `${property}/${detail.path.join('/')}` }
      }));
      return res.status(422).json({ errors });
    }
    req[property] = value;
    next();
  };
};