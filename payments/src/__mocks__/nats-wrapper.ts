export const natsWrapper = {
  client: {
    /**
     * publish event mock implementation
     */
    publish: jest.fn().mockImplementation((topic: string, data: string, callback: () => void) => {
      callback();
    }),
  },
};
