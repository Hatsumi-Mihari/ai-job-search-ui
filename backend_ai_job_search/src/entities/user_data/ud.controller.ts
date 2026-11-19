import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
} from '@nestjs/common';
import { UserDataService } from './ud.service.js';
import { CreateUserDataDto } from './dto/create-user-data.dto.js';
import { UserDataIdDto } from './dto/user-data-id.dto.js';
import { UpdateUserDataDto } from './dto/update-user-data.dto.js';
import {
  UpdateAddressDto,
  UpdateApplicationFormsMdDto,
  UpdateBehavioralProfileMdDto,
  UpdateCandidateProfileMdDto,
  UpdateClaudeMdDto,
  UpdateCoverLetterTemplatesMdDto,
  UpdateCoverTemplateUrlDto,
  UpdateCvTemplatesMdDto,
  UpdateEmailDto,
  UpdateImgUrlDto,
  UpdateInterviewPrepMdDto,
  UpdateJobEvaluationMdDto,
  UpdatePhoneDto,
  UpdateResumeTemplateUrlDto,
  UpdateSearchQueriesMdDto,
  UpdateSocialMediaDto,
  UpdateUserNameDto,
  UpdateSourcesResearchDto,
  UpdateWebResearchMdDto,
  UpdateWritingStyleMdDto,
} from './dto/update-user-data-field.dto.js';

/**
 * All identifiers and field values are sent in the request body, never in the
 * URL, so no route below declares a `:param` segment.
 */
@Controller('user-data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  // ------------------------------------------------------------------ read

  @Get()
  async getAll() {
    return await this.userDataService.findAll();
  }

  @Post('find')
  async getOne(@Body() dto: UserDataIdDto) {
    Logger.log('POST', '/user-data/find');
    return await this.userDataService.findOneById(dto.id);
  }

  // ---------------------------------------------------------------- create

  @Post()
  async create(@Body() createUserDataDto: CreateUserDataDto) {
    Logger.log('POST', '/user-data');
    return await this.userDataService.createUserData(createUserDataDto);
  }

  // ---------------------------------------------------------------- update

  /** Partial update: `id` selects the row, only the columns sent are changed. */
  @Patch('update')
  async update(@Body() updateUserDataDto: UpdateUserDataDto) {
    Logger.log('PATCH', '/user-data/update');
    return await this.userDataService.updateUserData(
      updateUserDataDto.id,
      updateUserDataDto,
    );
  }

  @Patch('user-name')
  async updateUserName(@Body() updateUserDataDto: UpdateUserNameDto) {
    Logger.log('PATCH', '/user-data/user-name');
    return await this.userDataService.updateUserDataUserName(
      updateUserDataDto.id,
      updateUserDataDto.user_name,
    );
  }

  @Patch('resume-template-url')
  async updateResumeTemplateUrl(
    @Body() updateUserDataDto: UpdateResumeTemplateUrlDto,
  ) {
    Logger.log('PATCH', '/user-data/resume-template-url');
    return await this.userDataService.updateUserDataResumeTemplateUrl(
      updateUserDataDto.id,
      updateUserDataDto.resume_template_url,
    );
  }

  @Patch('cover-template-url')
  async updateCoverTemplateUrl(
    @Body() updateUserDataDto: UpdateCoverTemplateUrlDto,
  ) {
    Logger.log('PATCH', '/user-data/cover-template-url');
    return await this.userDataService.updateUserDataCoverTemplateUrl(
      updateUserDataDto.id,
      updateUserDataDto.cover_template_url,
    );
  }

  @Patch('sources_research')
  async updateSourcesResearch(
    @Body() updateUserDataDto: UpdateSourcesResearchDto,
  ) {
    Logger.log('PATCH', '/user-data/sources_research');
    return await this.userDataService.updateUserDataSourcesResearch(
      updateUserDataDto.id,
      updateUserDataDto.sources_research,
    );
  }

  @Patch('email')
  async updateEmail(@Body() updateUserDataDto: UpdateEmailDto) {
    Logger.log('PATCH', '/user-data/email');
    return await this.userDataService.updateUserDataEmail(
      updateUserDataDto.id,
      updateUserDataDto.email,
    );
  }

  @Patch('phone')
  async updatePhone(@Body() updateUserDataDto: UpdatePhoneDto) {
    Logger.log('PATCH', '/user-data/phone');
    return await this.userDataService.updateUserDataPhone(
      updateUserDataDto.id,
      updateUserDataDto.phone,
    );
  }

  @Patch('address')
  async updateAddress(@Body() updateUserDataDto: UpdateAddressDto) {
    Logger.log('PATCH', '/user-data/address');
    return await this.userDataService.updateUserDataAddress(
      updateUserDataDto.id,
      updateUserDataDto.address,
    );
  }

  @Patch('social-media')
  async updateSocialMedia(@Body() updateUserDataDto: UpdateSocialMediaDto) {
    Logger.log('PATCH', '/user-data/social-media');
    return await this.userDataService.updateUserDataSocialMedia(
      updateUserDataDto.id,
      updateUserDataDto.social_media,
    );
  }

  @Patch('img-url')
  async updateImgUrl(@Body() updateUserDataDto: UpdateImgUrlDto) {
    Logger.log('PATCH', '/user-data/img-url');
    return await this.userDataService.updateUserDataImgUrl(
      updateUserDataDto.id,
      updateUserDataDto.img_url,
    );
  }

  // ------------------------------------------------- markdown document fields

  @Patch('claude-md')
  async updateClaudeMd(@Body() updateUserDataDto: UpdateClaudeMdDto) {
    Logger.log('PATCH', '/user-data/claude-md');
    return await this.userDataService.updateUserDataClaudeMd(
      updateUserDataDto.id,
      updateUserDataDto.claude_md,
    );
  }

  @Patch('candidate-profile-md')
  async updateCandidateProfileMd(
    @Body() updateUserDataDto: UpdateCandidateProfileMdDto,
  ) {
    Logger.log('PATCH', '/user-data/candidate-profile-md');
    return await this.userDataService.updateUserDataCandidateProfileMd(
      updateUserDataDto.id,
      updateUserDataDto.candidate_profile_md,
    );
  }

  @Patch('behavioral-profile-md')
  async updateBehavioralProfileMd(
    @Body() updateUserDataDto: UpdateBehavioralProfileMdDto,
  ) {
    Logger.log('PATCH', '/user-data/behavioral-profile-md');
    return await this.userDataService.updateUserDataBehavioralProfileMd(
      updateUserDataDto.id,
      updateUserDataDto.behavioral_profile_md,
    );
  }

  @Patch('writing-style-md')
  async updateWritingStyleMd(
    @Body() updateUserDataDto: UpdateWritingStyleMdDto,
  ) {
    Logger.log('PATCH', '/user-data/writing-style-md');
    return await this.userDataService.updateUserDataWritingStyleMd(
      updateUserDataDto.id,
      updateUserDataDto.writing_style_md,
    );
  }

  @Patch('job-evaluation-md')
  async updateJobEvaluationMd(
    @Body() updateUserDataDto: UpdateJobEvaluationMdDto,
  ) {
    Logger.log('PATCH', '/user-data/job-evaluation-md');
    return await this.userDataService.updateUserDataJobEvaluationMd(
      updateUserDataDto.id,
      updateUserDataDto.job_evaluation_md,
    );
  }

  @Patch('cv-templates-md')
  async updateCvTemplatesMd(@Body() updateUserDataDto: UpdateCvTemplatesMdDto) {
    Logger.log('PATCH', '/user-data/cv-templates-md');
    return await this.userDataService.updateUserDataCvTemplatesMd(
      updateUserDataDto.id,
      updateUserDataDto.cv_templates_md,
    );
  }

  @Patch('cover-letter-templates-md')
  async updateCoverLetterTemplatesMd(
    @Body() updateUserDataDto: UpdateCoverLetterTemplatesMdDto,
  ) {
    Logger.log('PATCH', '/user-data/cover-letter-templates-md');
    return await this.userDataService.updateUserDataCoverLetterTemplatesMd(
      updateUserDataDto.id,
      updateUserDataDto.cover_letter_templates_md,
    );
  }

  @Patch('interview-prep-md')
  async updateInterviewPrepMd(
    @Body() updateUserDataDto: UpdateInterviewPrepMdDto,
  ) {
    Logger.log('PATCH', '/user-data/interview-prep-md');
    return await this.userDataService.updateUserDataInterviewPrepMd(
      updateUserDataDto.id,
      updateUserDataDto.interview_prep_md,
    );
  }

  @Patch('application-forms-md')
  async updateApplicationFormsMd(
    @Body() updateUserDataDto: UpdateApplicationFormsMdDto,
  ) {
    Logger.log('PATCH', '/user-data/application-forms-md');
    return await this.userDataService.updateUserDataApplicationFormsMd(
      updateUserDataDto.id,
      updateUserDataDto.application_forms_md,
    );
  }

  @Patch('web-research-md')
  async updateWebResearchMd(@Body() updateUserDataDto: UpdateWebResearchMdDto) {
    Logger.log('PATCH', '/user-data/web-research-md');
    return await this.userDataService.updateUserDataWebResearchMd(
      updateUserDataDto.id,
      updateUserDataDto.web_research_md,
    );
  }

  @Patch('search-queries-md')
  async updateSearchQueriesMd(
    @Body() updateUserDataDto: UpdateSearchQueriesMdDto,
  ) {
    Logger.log('PATCH', '/user-data/search-queries-md');
    return await this.userDataService.updateUserDataSearchQueriesMd(
      updateUserDataDto.id,
      updateUserDataDto.search_queries_md,
    );
  }

  // ---------------------------------------------------------------- delete

  /** Deletes a user data record selected by the id sent in the request body. */
  @Delete('delete')
  async remove(@Body() dto: UserDataIdDto) {
    Logger.log('DELETE', '/user-data/delete');
    return await this.userDataService.deleteUserDataById(dto.id);
  }
}
