import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    //   const errors = validationResult(req);

    const errors = validationResult(req).formatWith(({ msg }) => msg);

    if (errors.isEmpty()) {
      return next();
    }
    res.status(200).send(
      {
        error: 'ERROR',
        error_message:  errors.array()[0],
        status: false,
        code: 400
    });
  };
};
