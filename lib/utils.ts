import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as math from "mathjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function calulateBorrowAPYFromInterestRate(
  interestRate: bigint,
): number {

  const rate = math.chain(math.number(interestRate)).divide(2 ** 64).add(1).done();

  let apy = math.chain(rate).pow(60 * 60 * 24 * 365).multiply(100).subtract(100).done() as math.BigNumber;

  return math.number(apy)
}

/**
 * Calculate the supply APY from the interest rate and utilization rate.
 * @param interestRate - The interest rate in the format of a BigInt.
 * @param utilization - The utilization rate as a percentage (0-100).
 * @return The supply APY as a percentage.
 * @example
 * const interestRate = BigInt(1000000000000000); // Example interest rate
 * const utilization = 75; // Example utilization rate
 * const supplyAPY = calulateSupplyAPYFromInterestRate(interestRate, utilization);
 * console.log(supplyAPY); // Output: Supply APY as a percentage
 *  */
export function calulateSupplyAPYFromInterestRate(interestRate: bigint, utilization: number): number {
  const borrowApy = calulateBorrowAPYFromInterestRate(interestRate);

  return borrowApy * utilization / 100
}

/**
 * Calculate the utilization rate of a vault.
 * @param cash - The amount of cash available in the vault.
 * @param totalBorrows - The total amount borrowed from the vault.
 * @return The utilization rate as a percentage.
 * @example
 * const cash = BigInt(1000);
 *  const totalBorrows = BigInt(500);
 * const utilizationRate = utilization(cash, totalBorrows);
 * console.log(utilizationRate); // Output: 50
 *  */
export function calculateUtilization(cash: bigint, totalBorrows: bigint): number {
  let total = cash + totalBorrows;
  if (total === BigInt(0)) {
    return 0; // Avoid division by zero
  }
  const utilzation = math.chain(math.bignumber(totalBorrows)).multiply(100).divide(math.bignumber(total)).done();

  return math.number(utilzation as math.BigNumber);
}
