import axios from 'axios';

describe('server run', () => {
  test('check for health route', async () => {
    // Given
    const axiosInstance = axios.create();

    // When
    const response = await axiosInstance.get('https://dsague.fr/health');

    // Then
    expect(response.data).toEqual('ok');
  });
});
