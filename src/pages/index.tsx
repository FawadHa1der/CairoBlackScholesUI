import {
  Box, Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";

import CTASection from "components/samples/CTASection";
import SomeText from "components/samples/SomeText";
import { BlackScholesForm, Transactions, VGVVForm } from "components/wallet";

const Home = () => {
  return (
    <Box mb={8} w="full" h="full" d="flex" flexDirection="column">
      <SomeText />
      <Box flex="1 1 auto">
        <Transactions />
        <Tabs>
          <TabList>
            <Tab>Black Scholes</Tab>
            <Tab>VGVV</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <BlackScholesForm />
            </TabPanel>
            <TabPanel>
              <VGVVForm />
            </TabPanel>
          </TabPanels>
        </Tabs>

      </Box>
      <CTASection />
    </Box>
  );
};

export default Home;
