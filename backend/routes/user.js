const express = require("express");
const userRouter = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
	username: zod.string().email(),
	password: zod.string(),
	username: zod.string(),
	username: zod.string(),
});
userRouter.post("/signup", async (req, res) => {
	const { success } = signupSchema.safeParse(req.body);
	if (!success) {
		return res.status(411).json({
			message: "Incorrect Inputs",
		});
	}
	const existingUser = await User.findOne({
		username: req.body.username,
	});
	if (existingUser) {
		res.status(411).json({
			message: "Account with this username already exists",
		});
	}
	const user = await User.create({
		username: req.body.username,
		password: req.body.password,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
	});
	const userId = user._id;

	await Account.create({
		userId,
		balance: 1 + Math.random() * 10000,
	});

	const token = jwt.sign(
		{
			userId,
		},
		JWT_SECRET
	);
	console.log(token);
	res.json({
		message: "User Created Successfully",
		token: token,
	});
});

const signinSchema = zod.object({
	username: zod.string().email(),
	password: zod.string(),
});
userRouter.post("/signin", async (req, res) => {
	const inputCred = {
		username: req.body.username,
		password: req.body.password,
	};
	const { success } = signinSchema.safeParse(inputCred);
	if (!success) {
		res.status(411).json({
			message: "Error while logging in",
		});
	}
	const user = await User.findOne(inputCred);
	if (!user) {
		res.status(411).json({
			message: "Incorrect Credentials!",
		});
	} else {
		const token = jwt.sign(
			{
				userId: user._id,
			},
			JWT_SECRET
		);
		res.json({
			message: "Signed In Successfully",
			token: token,
		});
	}
});

// userRouter.use(authMiddleware);
const updateSchema = zod.object({
	firstName: zod.string().optional(),
	lastName: zod.string().optional(),
	password: zod.string().min(8).optional(),
});
userRouter.put("/", authMiddleware, async (req, res) => {
	const { success, data } = updateSchema.safeParse(req.body);
	// console.log(updateSchema.safeParse(req.body));
	if (!success) {
		req.status(411).json({
			message: "Error while updating information",
		});
	}
	// console.log(req.userId);
	try {
		const updateStatus = await User.updateOne(
			{ _id: req.userId }, // Filter criteria
			{
				$set: req.body,
			} // Update fields
		);
		console.log(updateStatus);
		if (updateStatus.modifiedCount === 1) {
			return res.json({
				message: "Updated successfully",
			});
		} else {
			return res.status(404).json({
				message: "User not found or no changes made",
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Error while updating information",
		});
	}
});

userRouter.get("/bulk", async (req, res) => {
	const filter = req.query.filter || "";
	const users = await User.find({
		$or: [
			{
				firstName: {
					$regex: filter,
				},
			},
			{
				lastName: {
					$regex: filter,
				},
			},
		],
	});

	res.json({
		user: users.map((user) => ({
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			_id: user._id,
		})),
	});
});

module.exports = userRouter;
