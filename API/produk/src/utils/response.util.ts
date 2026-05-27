import { HttpStatus } from '@nestjs/common';

export function formatResponse(message: string, data?: any, status: HttpStatus = HttpStatus.OK) {
  return {
    success: true,
    message,
    ...(data !== undefined && { data }),
    metadata: { status },
  };
}
