import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

// Request -> AuthRequest
export interface AuthRequest extends Request {
  user?: any
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({
      message: "Token not found"
    })
  }

  // "Bearer eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6IjgyNTJkMWM2L"
  // ["Bearer", "eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6IjgyNTJkMWM2L"]
  // 0, 1
  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ message: "Invalid or expire token..!" })
  }
}
