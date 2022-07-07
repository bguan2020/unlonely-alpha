/**
 * Gets the token balance to the appropriate decimal amount.
 *
 * Because of the way smart contracts are written token amounts are separated into the balance and the decimal amount.
 * To get the amount of tokens an address has you'll need to perform the following calculation.
 */

export const getTokenBalanceToDecimal = (
  balance: number,
  decimal = 0
): number => (!decimal ? balance : balance * Math.pow(10, -decimal));

export default getTokenBalanceToDecimal;
