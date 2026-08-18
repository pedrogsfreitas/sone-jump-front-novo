import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CareersModule } from './careers/careers.module';
import { CatalogModule } from './catalog/catalog.module';
import { CommunityModule } from './community/community.module';
import { validateEnv } from './config/env.validation';
import { JobsModule } from './jobs/jobs.module';
import { LivesModule } from './lives/lives.module';
import { MentorsModule } from './mentors/mentors.module';
import { MentorshipSessionsModule } from './mentorship-sessions/mentorship-sessions.module';
import { PartnersModule } from './partners/partners.module';
import { PlansModule } from './plans/plans.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { ReferralsModule } from './referrals/referrals.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { SkillsModule } from './skills/skills.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RoadmapModule,
    CatalogModule,
    ProgressModule,
    SkillsModule,
    CommunityModule,
    JobsModule,
    PartnersModule,
    PlansModule,
    ReferralsModule,
    SubscriptionsModule,
    AdminModule,
    MentorsModule,
    MentorshipSessionsModule,
    LivesModule,
    CareersModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
