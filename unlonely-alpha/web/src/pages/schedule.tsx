import { Flex } from "@chakra-ui/react";

import AppLayout from "../components/layout/AppLayout";

export default function Schedule() {
  return (
    <AppLayout isCustomHeader={false}>
      <Flex height="100%">
        <iframe
          src="https://lu.ma/embed/calendar/cal-i5SksIDn63DmCXs/events?lt=dark"
          frameBorder="0"
          width="100%"
          aria-hidden="false"
        />
      </Flex>
    </AppLayout>
  );
}
