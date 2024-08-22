// src/controllers/adminController.js
import listPossibleEmployees from './adminController/listPossibleEmployees.js'
import convertToEmployee from './adminController/convertToEmployee.js'
import cancelEmployeeConversion from './adminController/cancelEmployeeConversion.js'
import getSearchStatus from './adminController/getSearchStatus.js'
import updateSearchNewEmployees from './adminController/updateSearchNewEmployees.js'
import updateConversionKey from './adminController/updateConversionKey.js'
import getConversionKey from './adminController/getConversionKey.js'
import listEmployees from './adminController/listEmployees.js'
import updateEmployee from './adminController/updateEmployee.js'

const adminController = {
  listPossibleEmployees,
  convertToEmployee,
  cancelEmployeeConversion,
  getSearchStatus,
  updateSearchNewEmployees,
  updateConversionKey,
  getConversionKey,
  listEmployees,
  updateEmployee
}

export default adminController
