import {
    Box,
    Button,
    Code,
    Link,
    Text,
    useBreakpointValue, Divider,

    useColorMode,
} from "@chakra-ui/react";
import { Abi, number, stark } from "starknet";
import { useContract, useStarknet, useStarknetInvoke, useStarknetCall } from "@starknet-react/core";
import { FormErrorMessage, FormLabel, FormControl, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';


// import our custom configuration for our chart
import { Config } from './ChartConfig';
// import { connect, getStarknet } from "@argent/get-starknet"

import { getStarknet } from "get-starknet"

import scholesAbi from "../../abi/black_scholes_contract.json";
import { callContract, createContract } from "utils/blockchain/starknet";
import { parseToUint256 } from "utils/parser";
import { BigNumber } from 'bignumber.js'
// t_annualised, volatility, spot, strike, rate


const CAIRO_PRIME = '3618502788666131213697322783095070105623107215331596699973092056135872020481'
const VGVVForm = () => {
    const toast = useToast()

    interface IVGVV {
        t_annualised: number;
        k: number;
        c_gamma: number;
        c_vanna: number;
        c_volga: number;
    }


    const [vgvv, setVGVV] = useState<string>();

    // const [t_annualized, setT_annualized] = useState<string>('');
    // const [volatility, setVolatility] = useState<string>('');
    // const [spot, setSpot] = useState<string>('');
    // const [strike, setStrike] = useState<string>('');
    // const [rate, setRate] = useState<string>('');

    const UNIT = 10 ** 27

    const CONTRACT_ADDRESS =
        "0x079d7c55d4756f21ebe05ec79dc9aa628fd252c9f967dd9fb1107bb4dce80584";
    const {
        handleSubmit, // handels the form submit event
        register, // ties the inputs to react-form
        formState: { errors, isSubmitting }, // gets errors and "loading" state
    } = useForm<IVGVV>();

    const { account } = useStarknet();
    // const { contract } = useContract({
    //   abi: scholesAbi as Abi[],
    //   address: CONTRACT_ADDRESS,
    // });

    const { colorMode } = useColorMode();
    const textSize = useBreakpointValue({
        base: "xs",
        sm: "md",
    });

    function parseFelt(feltString: string) {
        // const feltInt = parseInt(feltString)
        const unitBigNumber = new BigNumber(UNIT)
        const bigPrime = new BigNumber(CAIRO_PRIME)
        const halfPrimeBigNumber = bigPrime.dividedBy(2)
        const bigFelt = new BigNumber(feltString)
        console.log('big felt is ', bigFelt.toFixed())
        console.log('big half prime  is ', halfPrimeBigNumber.toFixed())

        console.log('big prime  is ', bigPrime.toFixed())
        if (bigFelt.isGreaterThan(halfPrimeBigNumber)) {
            console.log('big felt is bigger then cairo half prime')
            if (bigFelt.isLessThan(bigPrime)) {
                console.log('big felt is bigger then cairo half prime and less than big prime ', bigFelt.toFixed())

                const result = bigFelt.minus(bigPrime)
                console.log('felt is greater than half prime, difference is ', result.toFixed(), 'original ', bigFelt.toFixed())
                return result.dividedBy(unitBigNumber).toFixed()
            }
        }
        const result = bigFelt.dividedBy(unitBigNumber)
        return result.toFixed()
    }

    // (optional) connect the wallet
    async function onRegistered(vgvvParams: IVGVV) {
        // const { data: option_prices } = useStarknetCall({
        //   contract,
        //   method: "option_prices",
        //   args: [scholesInput.t_annualised, scholesInput.volatility, scholesInput.spot, scholesInput.strike, scholesInput.rate]
        // });

        toast({
            title: "Hang tight, this might take a bit",
            status: "success",
            duration: 30000,
            isClosable: false
        });

        let vgvvInput = { ...vgvvParams }
        vgvvInput.t_annualised = vgvvInput.t_annualised * UNIT
        vgvvInput.k = vgvvInput.k * UNIT // to convert to %
        vgvvInput.c_gamma = vgvvInput.c_gamma * UNIT
        vgvvInput.c_vanna = vgvvInput.c_vanna * UNIT
        vgvvInput.c_volga = vgvvInput.c_volga * UNIT // to convert to %

        console.log('vgvvInput   ', JSON.stringify(vgvvInput))
        // or try to connect to an approved wallet silently (on mount probably)
        // const someconnect = connect({ showList: false })
        const [userWalletContractAddress] = await getStarknet().enable()
        if (getStarknet().isConnected === false) {
            //throw Error("starknet wallet not connected")
        }
        const contract = createContract(CONTRACT_ADDRESS, scholesAbi as any)
        console.log('vgvvInput', BigInt(vgvvInput.t_annualised).toString(), BigInt(vgvvInput.k).toString(), BigInt(vgvvInput.c_gamma).toString(), BigInt(vgvvInput.c_vanna).toString(), BigInt(vgvvInput.c_volga).toString())

        //////////////////////OPTION PRICES ///////////////////////////////////////////////////////////
        const vgvvresult = await callContract(contract, 'vgvv', BigInt(vgvvInput.t_annualised).toString(), BigInt(vgvvInput.k).toString(), BigInt(vgvvInput.c_gamma).toString(), BigInt(vgvvInput.c_vanna).toString(), BigInt(vgvvInput.c_volga).toString())
        //    const priceresult = await callContract(contract, 'option_prices', parseToUint256(scholesInput.t_annualised.toString()).toString(), parseToUint256(scholesInput.volatility.toString()).toString(), parseToUint256(scholesInput.spot.toString()).toString(), parseToUint256(scholesInput.strike.toString()).toString(), BigInt(scholesInput.rate).toString())

        console.log('vgvvresult   ', JSON.stringify(vgvvresult))
        setVGVV(Math.sqrt(parseInt(parseFelt(vgvvresult[0]))).toFixed())
        toast.closeAll()
    }

    return (
        <Box>
            <Text as="h2" marginTop={4} fontSize="2xl">
                VGVV
            </Text>
            <Box d="flex" flexDirection="column">
                <Text>Test Contract:</Text>
                <Code marginTop={4} w="fit-content">
                    {/* {`${CONTRACT_ADDRESS.substring(0, 4)}...${CONTRACT_ADDRESS.substring(
              CONTRACT_ADDRESS.length - 4
            )}`} */}
                    <Link
                        isExternal
                        textDecoration="none !important"
                        outline="none !important"
                        boxShadow="none !important"
                        href={`https://goerli.voyager.online/contract/${CONTRACT_ADDRESS}`}
                    >
                        {CONTRACT_ADDRESS}
                    </Link>
                </Code>
                {account && (
                    <form onSubmit={handleSubmit(onRegistered)} noValidate>
                        {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
                        <FormControl >
                            <FormLabel >
                                Calculate the VGVV variance
                                {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
                            </FormLabel>
                        </FormControl >
                        <FormControl isInvalid={!!errors.t_annualised ? true : false} >
                            <FormLabel htmlFor="t_annualised">
                                Time annualized
                                {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
                            </FormLabel>

                            {/* you should use the save value for the id and the property name */}
                            <Input
                                id="t_annualised"
                                placeholder="4.23"
                                {
                                ...register("t_annualised", {
                                    required: "Don't forget the time annualized",
                                }) /* this register function will take care of the react-form binding to the ui */
                                }
                            ></Input>
                            {/* react-form will calculate the errors on submit or on dirty state */}
                            <FormErrorMessage>{errors.t_annualised && errors?.t_annualised?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!errors.k ? true : false}>
                            <FormLabel htmlFor="k">
                                k which is ln (S/K)
                            </FormLabel>
                            <Input
                                id="k"
                                placeholder=".1678"
                                {...register("k", {
                                    required: "please enter the k which ln S/K?",
                                })}
                            ></Input>
                            <FormErrorMessage>{errors.k && errors?.k?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.c_gamma ? true : false}>
                            <FormLabel htmlFor="c_gamma">
                                Cost of gamma
                            </FormLabel>
                            <Input
                                id="c_gamma"
                                placeholder=".1346378"
                                {...register("c_gamma", {
                                    required: "please enter the cost of gamma",
                                })}
                            ></Input>
                            <FormErrorMessage>{errors.c_gamma && errors?.c_gamma?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.c_vanna ? true : false}>
                            <FormLabel htmlFor="c_vanna">
                                Cost of vanna
                            </FormLabel>
                            <Input
                                id="c_vanna"
                                placeholder=".1865"
                                {...register("c_vanna", {
                                    required: "please enter cost of vanna?",
                                })}
                            ></Input>
                            <FormErrorMessage>{errors.c_vanna && errors?.c_vanna?.message}</FormErrorMessage>
                        </FormControl>


                        <FormControl isInvalid={!!errors.c_volga ? true : false}>
                            <FormLabel htmlFor="c_volga">
                                Cost of volga
                            </FormLabel>
                            <Input
                                id="c_volga"
                                placeholder=".5"
                                {...register("c_volga", {
                                    required: "please enter cost of volga?",
                                })}
                            ></Input>
                            <FormErrorMessage>{errors.c_volga && errors?.c_volga?.message}</FormErrorMessage>
                        </FormControl>

                        <Button mt={10} colorScheme="blue" isLoading={isSubmitting} type="submit">
                            CALCULATE 🐱‍🏍
                        </Button>

                        <Text
                            letterSpacing="wide"
                            textDecoration="underline"
                            as="h3"
                            fontWeight="semibold"
                            fontSize="l"
                        >
                            <Divider my="1rem" />

                            VGVV {vgvv}
                        </Text>
                    </form>

                )}
                {!account && (
                    <Box
                        backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
                        padding={4}
                        marginTop={4}
                        borderRadius={4}
                    >
                        <Box fontSize={textSize}>
                            Connect your wallet to use vgvv
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default VGVVForm;
