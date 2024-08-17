const { get_database, post_database } = require("../../config/db_utils");

exports.get_dates = async (req, res) => {
    try {
      const query = `
          SELECT id, dates FROM holidays; 
      `;
      const dates = await get_database(query);
  
      const formattedDates = dates.map(dateObj => {
        const date = new Date(dateObj.dates);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
  
        // Format the date as "Month DD, YYYY"
        return `${monthNames[monthIndex]} ${day}, ${year}`;
      });
  
      res.json(formattedDates);
    } catch (err) {
      console.error("Error fetching dates", err);
      res.status(500).json({ error: "Error fetching dates" });
    }
  };

exports.post_dates = async (req, res) => {
    try {
      if(!Array.isArray(req.body.dates)){
          return res.status(400).json({message:'Inavalid json format'})
      }
  
      for(const date of req.body.dates){
      const query = `
          INSERT INTO holidays(dates)VALUE(?)
          `;
      const success_message = await post_database(
        query,date,
        "Dates added successfully"
      );
      if(!success_message){
          return res.status(500).json({ message: 'Failed to add date to the database.' });
  
      }
  }
      res.json({ message: 'Dates added successfully' });
    } catch (err) {
      console.error("Error Adding Dates");
    }
  };