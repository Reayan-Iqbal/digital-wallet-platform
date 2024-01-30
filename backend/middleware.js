const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./config");
const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(403).json({
			message: "Authorization Token Error",
		});
	} else {
		const token = authHeader.split(" ")[1];
		try {
			const userId = jwt.verify(token, JWT_SECRET).userId;
			req.userId = userId;
		} catch (error) {
			res.status(403).json({
				message: "Unauthorized User",
			});
		}
	}
	next();
};
module.exports = { authMiddleware };
