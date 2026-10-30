import { Test } from '@nestjs/testing';
import { AppModule } from './app.module.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppModule (unit)', () => {
  it('compiles the empty DI graph with PrismaService overridden', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(PrismaService)).toEqual({});
  });
});
