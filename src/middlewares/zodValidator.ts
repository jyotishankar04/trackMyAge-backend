import z from "zod";

const userRegistrationSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

export { userRegistrationSchema, userLoginSchema };
