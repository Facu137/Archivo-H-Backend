// src/controllers/adminController.js
import listPossibleEmployees from './adminController/listPossibleEmployees.js'
import convertToEmployee from './adminController/convertToEmployee.js'
import updateSearchNewEmployees from './adminController/updateSearchNewEmployees.js'
import updateConversionKey from './adminController/updateConversionKey.js'
import getConversionKey from './adminController/getConversionKey.js'

const adminController = {
  listPossibleEmployees,
  convertToEmployee,
  updateSearchNewEmployees,
  updateConversionKey,
  getConversionKey
}

export default adminController
