let lcn = 1
let demos = 1000000000000000000
export default{
  convertToEur(balance, conversion){
    if(conversion == null){
      return 0
    }
    if(balance){
      const convertedBalance = parseInt(balance, 16)
      console.log({
        convertedBalance: {
          value: convertedBalance,
          conversion: conversion.value
        }
      })
      return conversion ? `EUR ${convertedBalance * conversion.value}` : null  
    }else{
      return 0
    }
  },
  demosToLiquichain(amount){
    return parseFloat(parseInt(amount, 16) / demos).toFixed(18)
  },
  lcnToDemos(amount){
    return parseFloat(parseInt(amount, 16) * demos).toFixed(18)
  }
}