import { Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex as="footer" width="full" align="center">
      <Text>
        {new Date().getFullYear()} -{" "}
        <Link
          textDecoration="none !important"
          outline="none !important"
          boxShadow="none !important"
          href="https://github.com/fawadha1der"
          isExternal
        >
          github.com/fawadha1der
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
