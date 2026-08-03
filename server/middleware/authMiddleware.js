const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access Denied",
            });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        console.log("Token:", token);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        });

    }
};

module.exports = authMiddleware;