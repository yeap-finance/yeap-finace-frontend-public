import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
// Internal utils
import { convertAmountFromHumanReadableToOnChain } from "@/utils/helpers";
import { YEAP_DEPLOYER_ADDRESS } from "@/constants";
import { e } from "mathjs";

export const depositToVault = (args: {
    vault: `0x${string}`;
    amount: bigint;
}): InputTransactionData => {
    const { vault, amount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::earn_api::deposit`,
            typeArguments: [],
            functionArguments: [vault, amount],
        },
    };
};

export const withdrawFromVault = (args: {
    vault: `0x${string}`;
    amount: bigint;
}): InputTransactionData => {
    const { vault, amount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::earn_api::withdraw`,
            typeArguments: [],
            functionArguments: [vault, amount],
        },
    };
}

export const redeemFromVault = (args: {
    vault: `0x${string}`;
    amount: bigint;
}): InputTransactionData => {
    const { vault, amount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::earn_api::redeem`,
            typeArguments: [],
            functionArguments: [vault, amount],
        },
    };
}


export const borrowOnPosition = (args: {
    positionId: `0x${string}`;
    amount: bigint;
}): InputTransactionData => {
    return addCollaterlAndBorrowMore({ ...args, collateralAmount: BigInt(0) });
}

export const addCollaterlAndBorrowMore = (args: {
    positionId: `0x${string}`;
    collateralAmount: bigint;
    amount: bigint;
}): InputTransactionData => {
    const { positionId, collateralAmount, amount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::borrow_api::add_collateral_and_borrow_more`,
            typeArguments: [],
            functionArguments: [positionId, collateralAmount, amount],
        },
    };
}

export const withdrawCollateral = (args: {
    positionId: `0x${string}`;
    collateralAmount: bigint;
}): InputTransactionData => {
    const { positionId, collateralAmount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::borrow_api::withdraw_collateral`,
            typeArguments: [],
            functionArguments: [positionId, collateralAmount],
        },
    };
}


export const repayPosition = (args: {
    positionId: `0x${string}`;
    amount: bigint;
}): InputTransactionData => {
    const { positionId, amount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::borrow_api::repay`,
            typeArguments: [],
            functionArguments: [positionId, amount],
        },
    };
}

export const addCollaterlAndBorrow = (args: {
    collateralAsset: `0x${string}`;
    borrowVault: `0x${string}`;
    collateralAmount: bigint;
    borrowAmount: bigint;
}): InputTransactionData => {
    const { collateralAsset, borrowVault, collateralAmount, borrowAmount: amount } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::borrow_api::add_collateral_and_borrow`,
            typeArguments: [],
            functionArguments: [collateralAsset, borrowVault, collateralAmount, amount],
        },
    };
}

export const openShortPosition = (args: {
    shortVault: string, collateralVault: string;
    collateralAmount: bigint;
    shortAmount: bigint;
    swapPath: `0x${string}`[];
    amountOutMin: bigint;
}): InputTransactionData => {
    const { shortVault, collateralVault, collateralAmount, shortAmount, swapPath, amountOutMin } = args;
    return {
        data: {
            function: `${YEAP_DEPLOYER_ADDRESS}::leverager_api::open_leverage_position_by_hyper`,
            typeArguments: [],
            functionArguments: [
                collateralVault,
                shortVault,
                collateralAmount,
                shortAmount,
                swapPath,
                amountOutMin,
            ]
        }
    }
}
