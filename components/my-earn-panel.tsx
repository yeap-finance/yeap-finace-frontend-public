'use client'
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"

import { accountBalanceQuery, getEarnData, getVaultAddresses, getVaultDetail, VaultDetail } from '@/services/api';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { calulateSupplyAPYFromInterestRate } from '@/lib/utils';
import { it } from 'node:test';
import { ExternalLink } from 'lucide-react';
import { NETWORK } from '@/constants';
import { convertAmountFromOnChainToHumanReadable } from '@aptos-labs/ts-sdk';

async function getAllVaultInfos(): Promise<Record<`0x${string}`, VaultDetail>> {
    const allVaultAddresses = await getVaultAddresses();
    const vaults = await Promise.all(allVaultAddresses.map((vaultAddress) => {
        return getVaultDetail(vaultAddress);
    }));
    return Object.fromEntries(vaults.map(v => ([v.vaultAddress, v])));
}


export function MyEarnPanel() {
    const router = useRouter();

    const { account } = useWallet()
    const { data: allVaults, isLoading: loading, error } = useQuery({
        queryKey: ["vaults"],
        queryFn: getAllVaultInfos,
    })

    const userVaultBalances = useQueries({
        queries: ((account && allVaults) ? Object.values(allVaults) : []).map((vault) => {
            return accountBalanceQuery(account?.address as `0x${string}`, vault.vaultAsset.asset_type as `0x${string}`);
        }),
        combine: (results) => {
            const vaultBalances = results.filter(r => r.isSuccess).map((result) => {

                return result.data;

            });
            return {
                data: vaultBalances,
                isLoading: results.some(v => v.isLoading),
                error: results.find(v => v.isError)?.error
            };
        }
    })

    if (userVaultBalances.isLoading) {
        return (
            <section className="bg-slate-800 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">My Earn</h2>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </section>
        );
    };

    if (userVaultBalances.error) {
        console.error("Error fetching vault balances:", userVaultBalances.error);
        return <div>Error loading vault balances</div>;
    }

    const earnData = userVaultBalances.data.map((vaultBalance) => {
        const vaultAddress = vaultBalance.asset_type;
        const vaultDetail = allVaults![vaultAddress as `0x${string}`];
        return {
            ...vaultDetail,
            userBalance: vaultBalance
        }
    });

    return (
        <section className="bg-slate-800 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">My Earn</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">

                            <th className="py-2 px-4">Vault Name</th>
                            <th className="py-2 px-4">My Deposit</th>
                            <th className="py-2 px-4">Instant APY</th>
                            <th className="py-2 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {earnData?.map((item, idx) => {
                            const apy = calulateSupplyAPYFromInterestRate(item.vaultState.interestRate, item.vaultState.utilization);

                            return (
                                <tr key={idx} className="border-b border-slate-700">
                                    <td className="py-2 px-4">
                                        <a
                                            href={`https://explorer.aptoslabs.com/account/${item.vaultAddress}?network=${NETWORK}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline flex items-center"
                                        >
                                            {item.vaultAsset.name}
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>


                                    </td>
                                    <td className="py-2 px-4"><span className="text-slate-400">{convertAmountFromOnChainToHumanReadable(Number(item.userBalance.amount), item.underlyingAsset.decimals)}</span> {item.underlyingAsset.name} </td>
                                    <td className="py-2 px-4">{apy.toFixed(4)}%</td>
                                    <td className="py-2 px-4 text-right">
                                        <button
                                            className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                                            onClick={() => router.push(`/vaults/${item.vaultAsset.asset_type}/supply`)} // Navigate to supply
                                        >
                                            Supply
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-3 py-1 rounded"
                                            onClick={() => router.push(`/vaults/${item.vaultAsset.asset_type}/withdraw`)} // Navigate to withdraw
                                        >
                                            Withdraw
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
