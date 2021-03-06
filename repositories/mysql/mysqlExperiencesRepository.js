const { param } = require('express/lib/request')
const res = require('express/lib/response')
const connection = require('./mysqlConnection')


const createExperience = async (experienceData, path) => {
  let availableSeats = experienceData.totalSeats
  let resultsExp
  let resultsDat
  if (path) {
    resultsExp = await connection.query("INSERT INTO experiences (experienceName, experienceDescription, price, experiencePhoto, place_id) VALUES ( ?, ?, ?, ?, ? )  ", [experienceData.experienceName, experienceData.experienceDescription, experienceData.price, path, experienceData.place_id])
    resultsDat = await connection.query("INSERT INTO dates (experience_id, totalSeats, availableSeats, experienceDate,  experienceHour) VALUES (?, ?, ?, ?, ? )  ", [resultsExp[0].insertId, experienceData.totalSeats, availableSeats, experienceData.experienceDate, experienceData.experienceHour])
  } else {
    resultsExp = await connection.query("INSERT INTO experiences (experienceName, experienceDescription, price, place_id) VALUES ( ?, ?, ?, ? )  ", [experienceData.experienceName, experienceData.experienceDescription, experienceData.price, experienceData.place_id])
    resultsDat = await connection.query("INSERT INTO dates (experience_id, totalSeats, availableSeats, experienceDate,  experienceHour) VALUES (?, ?, ?, ?, ? )  ", [resultsExp[0].insertId, experienceData.totalSeats, availableSeats, experienceData.experienceDate, experienceData.experienceHour])

  }
  return (resultsExp[0], resultsDat[0])
}


const getExperienceById = async (experienceId) => {

  let results = await connection.query('SELECT experiences.*, places.placeName, dates.idDate, DATE_FORMAT(dates.experienceDate, "%Y-%m-%d") AS experienceDate, TIME_FORMAT(dates.experienceHour, "%H:%m" ) AS experienceHour, dates.totalSeats, dates.availableSeats FROM experiences LEFT JOIN places ON experiences.place_id = places.id LEFT JOIN dates ON experiences.id = dates.experience_id WHERE experiences.id = ? ', [experienceId])

  return results[0]
}

const getExperienceByIdDate = async (experienceId, experienceDate) => {
  let results = await connection.query("SELECT experiences.*, places.placeName, dates.experienceHour, dates.totalSeats, dates.availableSeats FROM experiences LEFT JOIN places ON experiences.place_id = places.id LEFT JOIN dates ON experiences.id = dates.experience_id WHERE experiences.id = ? AND dates.experienceDate = ?", [experienceId, experienceDate])

  return results[0]
}

const getExperiences = async () => {

  let results = await connection.query("SELECT experiences.*, places.placeName FROM experiences LEFT JOIN places ON experiences.place_id = places.id")
  return results[0]
}

const deleteExperience = async (experienceId) => {

  let results = await connection.query("DELETE FROM experiences WHERE id = ? ", [experienceId])
  return results[0]
}


const getExperiencesByPlace = async (place_id) => {
  let results = await connection.query("SELECT * FROM experiences WHERE place_id= ? ", [place_id])
  return results[0]
}
const editExperience = async (experienceData, experienceId, path) => {
  let resultsExp
  if (path) {
    resultsExp = await connection.query("UPDATE experiences SET experienceName = ?, experienceDescription = ?, price = ?, experiencePhoto = ?, place_id = ? WHERE id = ? ", [experienceData.experienceName, experienceData.experienceDescription, experienceData.price, path, experienceData.place_id, experienceId])

  } else {
    resultsExp = await connection.query("UPDATE experiences SET experienceName = ?, experienceDescription = ?, price = ?,  place_id = ? WHERE experiences.id = ? ", [experienceData.experienceName, experienceData.experienceDescription, experienceData.price, experienceData.place_id, experienceId])

  }
  return (resultsExp)
}

const searchExperiences = async (place, dateFrom, dateTo, lowPrice, highPrice) => {
  let results
  const params = []
  const conditions = []

  let query = "SELECT experiences.* FROM experiences LEFT JOIN places ON experiences.place_id = places.id LEFT JOIN dates ON experiences.id = dates.experience_id"
  // let query = "SELECT experiences.*,places.* ,dates.* FROM experiences LEFT JOIN places ON experiences.place_id = places.id LEFT JOIN dates ON experiences.id = dates.experience_id"

  if (place || dateFrom || dateTo || lowPrice || highPrice) {
    query += " WHERE "
  }

  if (place) {
    conditions.push(" places.placeName = ?")
    params.push(place)
  }

  if (dateFrom && dateTo) {
    conditions.push(" dates.experienceDate BETWEEN ? AND ?")
    params.push(dateFrom)
    params.push(dateTo)
  } else if (dateFrom) {
    conditions.push(" dates.experienceDate >= ?")
    params.push(dateFrom)
  } else if (dateTo) {
    conditions.push(" dates.experienceDate <= ?")
    params.push(dateTo)
  }

  if (lowPrice && highPrice) {
    conditions.push(" experiences.price BETWEEN ? AND ?")
    params.push(lowPrice)
    params.push(highPrice)
  } else if (lowPrice) {
    conditions.push(" experiences.price >= ?")
    params.push(lowPrice)
  } else if (highPrice) {
    conditions.push(" experiences.price <= ?")
    params.push(highPrice)
  }
  query += conditions.join(" AND")
  results = await connection.query(query, params)
  return results[0]
}

module.exports = {
  getExperiences,
  getExperienceById,
  getExperienceByIdDate,
  createExperience,
  editExperience,
  searchExperiences,
  getExperiencesByPlace,
  deleteExperience
}
