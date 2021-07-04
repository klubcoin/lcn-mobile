export default{
  convertToEur(balance, conversion){
    if(balance){
      const value = balance.substring(2, balance.length)
      const convertedBalance = parseFloat(value)
      return conversion ? `EUR ${convertedBalance * conversion.value}` : null  
    }else{
      return null
    }
  }
}