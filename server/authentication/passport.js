import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../app.js";

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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Find user by id using Prisma
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
