import dotenv from "dotenv";
import passport from "passport";
import { prisma } from "../app.js";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
dotenv.config();

passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      try {
        // Find user by username using Prisma
        const user = await prisma.user.findUnique({
          where: { username: username },
        });

        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        console.error("Login error:", err);
        return done(err);
      }
    }
  )
);

const jwtSecret = process.env.JWT_SECRET;

console.log(`jwtSecret: ${jwtSecret}`);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.id },
      });

      if (user) return done(null, user);

      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
