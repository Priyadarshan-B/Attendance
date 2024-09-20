const { get_database } = require("../../config/db_utils");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Store in env file

exports.get_auth = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const mentorQuery = "SELECT id, name, gmail, role_id FROM mentor WHERE gmail = ?";
        let results = await get_database(mentorQuery, [email]);

        if (results.length > 0) {
            const mentor = results[0];
            const token = jwt.sign({
                id: mentor.id,
                name: mentor.name,
                gmail: mentor.gmail,
                role_id: mentor.role_id
            }, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                token,
                user: {
                    id: mentor.id,
                    name: mentor.name,
                    gmail: mentor.gmail,
                    role_id: mentor.role_id
                }
            });
        }

        const studentQuery = "SELECT id, name, gmail, register_number, role_id FROM students WHERE gmail = ?";
        results = await get_database(studentQuery, [email]);

        if (results.length > 0) {
            const student = results[0];
            const token = jwt.sign({
                id: student.id,
                name: student.name,
                gmail: student.gmail,
                role_id: student.role_id,
                register_number: student.register_number
            }, JWT_SECRET, { expiresIn: '24h' });

            return res.status(200).json({
                token,
                user: {
                    id: student.id,
                    name: student.name,
                    gmail: student.gmail,
                    role_id: student.role_id,
                    register_number: student.register_number
                }
            });
        }

        // If no user is found
        return res.status(404).json({ error: "Email not found." });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
