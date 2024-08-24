const { get_database, post_database } = require("../../config/db_utils");

exports.get_favorites = async (req, res) => {
  const mentor = req.query.mentor;
  try {
    const query = `
        SELECT mentor.name,mentor.id AS mentor_id, students.id AS id,students.name, students.register_number, students.year
        FROM favourites f
        JOIN mentor ON f.mentor = mentor.id
        JOIN students ON f.student = students.id
        WHERE  f.mentor =?
        AND f.status = '1'

        `;
    const favorites = await get_database(query, [mentor]);
    res.json(favorites);
  } catch (err) {
    console.error("Error Fetching favourites List", err);
    res.status(500).json({ error: "Error fetching favourites List" });
  }
};

exports.post_favourites = async (req, res) => {
  const { mentor, student } = req.body;
  if (!mentor || !student) {
    return res.status(400).json({ error: "Mentor and student ids are required." });
  }

  try {
    const checkQuery = `
      SELECT * FROM favourites WHERE mentor = ? AND student = ?;
    `;
    const existingRecord = await post_database(checkQuery, [mentor, student]);

    if (existingRecord.length > 0) {
      return res.status(409).json({ message: "This favourite already exists." });
    }

    const insertQuery = `
      INSERT INTO favourites (mentor, student) VALUES (?, ?);
    `;
    const post_fav = await post_database(insertQuery, [mentor, student]);
    res.json(post_fav);

  } catch (err) {
    console.error("Error inserting favourites list", err);
    res.status(500).json({ error: "Error inserting favourites list" });
  }
};

exports.delete_favourites = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ erro: "ids are required.." });
  }
  try {
    const query = `
        UPDATE favourites 
        SET status = '1'
        WHERE id = ?
        `;
    const delFav = await post_database(query, [id]);
    res.json(delFav);
  } catch (err) {
    console.error("Mentor-Student List", err);
    res.status(500).json({ error: "Error fetching Mentor-Student List" });
  }
};
