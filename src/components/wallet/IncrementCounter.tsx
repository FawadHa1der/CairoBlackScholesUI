import {
  Box,
  Button,
  Code,
  Link,
  Text,
  useBreakpointValue, Divider,

  useColorMode,
} from "@chakra-ui/react";
import { Abi, stark } from "starknet";
import { useContract, useStarknet, useStarknetInvoke, useStarknetCall } from "@starknet-react/core";
import { FormErrorMessage, FormLabel, FormControl, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from '@chakra-ui/react'
// import { connect, getStarknet } from "@argent/get-starknet"

import { getStarknet } from "get-starknet"

import scholesAbi from "../../abi/black_scholes_contract.json";
import { callContract, createContract } from "utils/blockchain/starknet";

// t_annualised, volatility, spot, strike, rate


const IncrementCounter = () => {
  interface IScholes {
    t_annualised: number;
    volatility: number;
    spot: number;
    strike: number;
    rate: number;
  }

  const [callPrice, setCallPrice] = useState<string>();
  const [putPrice, setPutPrice] = useState<string>();
  const [vega, setVega] = useState<string>();

  // const [t_annualized, setT_annualized] = useState<string>('');
  // const [volatility, setVolatility] = useState<string>('');
  // const [spot, setSpot] = useState<string>('');
  // const [strike, setStrike] = useState<string>('');
  // const [rate, setRate] = useState<string>('');

  const CONTRACT_ADDRESS =
    "0x02cdd33fe5d4b3ad626cdfd0efa497c21add6fa873bfec7e22f796ba9c48e354";
  const {
    handleSubmit, // handels the form submit event
    register, // ties the inputs to react-form
    formState: { errors, isSubmitting }, // gets errors and "loading" state
  } = useForm<IScholes>();

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

  // (optional) connect the wallet

  async function onRegistered(scholesInput: IScholes) {
    const UNIT = 10 ** 27
    // const { data: option_prices } = useStarknetCall({
    //   contract,
    //   method: "option_prices",
    //   args: [scholesInput.t_annualised, scholesInput.volatility, scholesInput.spot, scholesInput.strike, scholesInput.rate]
    // });

    scholesInput.t_annualised = scholesInput.t_annualised * UNIT
    scholesInput.volatility = scholesInput.volatility * UNIT
    scholesInput.spot = scholesInput.spot * UNIT
    scholesInput.strike = scholesInput.strike * UNIT
    scholesInput.rate = scholesInput.rate * UNIT

    console.log('scholesInput   ', JSON.stringify(scholesInput))
    // or try to connect to an approved wallet silently (on mount probably)
    // const someconnect = connect({ showList: false })
    const [userWalletContractAddress] = await getStarknet().enable()
    if (getStarknet().isConnected === false) {
      throw Error("starknet wallet not connected")
    }
    const contract = createContract(CONTRACT_ADDRESS, scholesAbi as any)
    // const result = await callContract(contract, 'option_prices', BigInt(scholesInput.t_annualised).toString(), scholesInput.volatility, scholesInput.spot, scholesInput.strike, scholesInput.rate)
    const priceresult = await callContract(contract, 'option_prices', BigInt(scholesInput.t_annualised).toString(), BigInt(scholesInput.volatility).toString(), BigInt(scholesInput.spot).toString(), BigInt(scholesInput.strike).toString(), BigInt(scholesInput.rate).toString())
    console.log('result   ', JSON.stringify(priceresult))
    setCallPrice((parseInt(priceresult[0]) / UNIT).toString())
    setPutPrice((parseInt(priceresult[1]) / UNIT).toString())


    const vegaresult = await callContract(contract, 'vega', BigInt(scholesInput.t_annualised).toString(), BigInt(scholesInput.volatility).toString(), BigInt(scholesInput.spot).toString(), BigInt(scholesInput.strike).toString(), BigInt(scholesInput.rate).toString())
    console.log('result   ', JSON.stringify(vegaresult))
    setVega((parseInt(vegaresult[0]) / UNIT).toString())


  }

  return (
    <Box>
      <Text as="h2" marginTop={4} fontSize="2xl">
        Black Scholes
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
                Calculate the price of your option
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
            <FormControl isInvalid={!!errors.volatility ? true : false}>
              <FormLabel htmlFor="volatility">
                Volatility
              </FormLabel>
              <Input
                id="volatility"
                placeholder="15"
                {...register("volatility", {
                  required: "please enter the implied volitility?",
                })}
              ></Input>
              <FormErrorMessage>{errors.volatility && errors?.volatility?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.spot ? true : false}>
              <FormLabel htmlFor="spot">
                Spot
              </FormLabel>
              <Input
                id="spot"
                placeholder="23.1"
                {...register("spot", {
                  required: "please enter the spot price",
                })}
              ></Input>
              <FormErrorMessage>{errors.spot && errors?.spot?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.strike ? true : false}>
              <FormLabel htmlFor="strike">
                Strike
              </FormLabel>
              <Input
                id="strike"
                placeholder="23.1"
                {...register("strike", {
                  required: "please enter the strike price?",
                })}
              ></Input>
              <FormErrorMessage>{errors.strike && errors?.strike?.message}</FormErrorMessage>
            </FormControl>


            <FormControl isInvalid={!!errors.rate ? true : false}>
              <FormLabel htmlFor="rate">
                Rate
              </FormLabel>
              <Input
                id="rate"
                placeholder="5"
                {...register("rate", {
                  required: "please enter the interest rate?",
                })}
              ></Input>
              <FormErrorMessage>{errors.rate && errors?.rate?.message}</FormErrorMessage>
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

              Call Option Price {callPrice}
              <Divider my="1rem" />
              Put Option Price {putPrice}
              <Divider my="1rem" />

              Vega {vega}
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
              Connect your wallet to use scholes
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IncrementCounter;
