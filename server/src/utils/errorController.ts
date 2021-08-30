import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { UnauthorizedError } from 'express-jwt';

const handleDuplicateKeyError = (err: any, res: Response) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  res.status(code).json({
    status: code,
    message: `An account with that ${field} already exists`,
    data: null,
  });
};

const handleValidationError = (err: any, res: Response) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const fields = Object.values(err.errors).map((el: any) => el.path);
  const code = 400;

  if (errors.length > 1) {
    const formattedErrors = errors.join(' ');
    res.status(code).json({
      status: code,
      data: formattedErrors,
      fields,
    });
  } else {
    res.status(code).json({
      message: errors,
      status: code,
      data: fields,
    });
  }
};

const handleUnAuthorizedError = (err: UnauthorizedError, res: Response) => {
  const { message, name, status } = err;
  res.status(status).json({
    message: `${name}:${message}`,
    status: status,
    data: message,
  });
};

const mainErrorController: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (err.name === 'UnauthorizedError') {
      return (err = handleUnAuthorizedError(err, res));
    }
    if (err.name === 'ValidationError')
      return (err = handleValidationError(err, res));
    if (err.code && err.code == 11000)
      return (err = handleDuplicateKeyError(err, res));
  } catch (err) {
    res.status(500).send({
      status: 500,
      message: 'An unknown error has occurred',
      data: null,
    });
  }
};

export default mainErrorController;
