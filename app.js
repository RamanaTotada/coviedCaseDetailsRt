const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "covid19India.db");

let database = null;
const inisalizarionDBandServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Db error ${error.message}`);
  }
};

inisalizarionDBandServer();

//state database

const stateDbObjectToResponseDbObject = (DbObject) => {
  return {
    stateId: DbObject.state_id,
    stateName: DbObject.state_name,
    population: DbObject.population,
  };
};
//distic table
//district_id	INTEGER
//district_name	TEXT
//state_id	INTEGER
//cases	INTEGER
//cured	INTEGER
//active	INTEGER
// deaths	INTEGER

const disticDbObjectToResponseObject = (DbObject) => {
  return {
    districtId: DbObject.district_id,
    districtName: DbObject.district_name,
    stateId: DbObject.state_id,
    cases: DbObject.cases,
    cured: DbObject.cured,
    active: DbObject.active,
    deaths: DbObject.deaths,
  };
};

//api for /states/

app.get("/states/", async (request, response) => {
  const StateQuesy = `
     SELECT * 
     FROM
     state

     ;`;

  const stateTable = await database.all(StateQuesy);
  response.send(
    stateTable.map((eachState) => stateDbObjectToResponseDbObject(eachState))
  );
});

// api for state id /states/:stateId/

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const stateIdQuery = `
    SELECT * FROM state
    WHERE
    state_id = ${stateId};


    `;

  const stateIdFromDb = await database.run(stateIdQuery);
  response.send(stateDbObjectToResponseDbObject(stateIdFromDb));
});

//api for dirstics upadate

app.post("/districts/", async (request, response) => {
  const {
    districtId,
    districName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = request.body;
  const createDistrict = `
  INSERT INTO 
  district
  (districtId,districName,stateId,cases,cured,active,deaths)
  VALUES
  (${district_id},'${district_name}','${state_id}','${cases}','${cured}','${active}',
  '${deaths}')
  ;`;
  const districtcreate = await database.run(createDistrict);
  response.send("District Successfully Added");
});

/// api fro /districts/:districtId/
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const stateIdQuery = `
    SELECT * FROM district
    WHERE
    district_id = ${districtId};
    `;

  const stateIdFromDb = await database.run(stateIdQuery);
  response.send(disticDbObjectToResponseObject(stateIdFromDb));
});

/// api for /districts/:districtId/

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteDistrictQuery = `
        DELETE FROM district
    WHERE
    district_id = ${districtId};
    `;

  const deletedDistrictFromDb = await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

/// api for /districts/:districtId/

//district_name	TEXT
//state_id	INTEGER
//cases	INTEGER
//cured	INTEGER
//active	INTEGER
// deaths	INTEGER

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const updateDistrict = `
  update 
  district
   SET
   districtName = '${district_name}',
   stateId = '${state_id}',
   cases = '${cases}',
   cured = '${cured}',
   active = '${active}',
   deaths = '${deaths}';
   WHERE
   district_id = '${districtId}'

  ;`;
  const districtUpdate = await database.run(updateDistrict);
  response.send("District Detailsils Updated");
});

////states/:stateId/stats/
//Method: GET
//Description:
//Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
    WHERE
      state_id=${stateId};`;
  const stats = await database.get(getStateStatsQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
///api for district

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const stateIdQuery = `
    SELECT state_name 
     FROM district

    NATURAL JOIN
    state
    WHERE
    district_id = ${districtId};
    `;

  const stateIdFromDb = await database.run(stateIdQuery);
  response.send((stateName: stateIdFromDb.state_name));
});

module.exports = app;
