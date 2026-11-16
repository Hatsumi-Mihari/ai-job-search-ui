import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
} from '@nestjs/common';
import { CompanyResearchService } from './cr.service.js';
import { CreateCompanyResearchDto } from './dto/create-company-research.dto.js';
import { CompanyResearchIdDto } from './dto/company-research-id.dto.js';
import { UpdateCompanyResearchDto } from './dto/update-company-research.dto.js';
import {
  UpdateCompanyResearchCompanyDto,
  UpdateCompanyResearchFetchedDateDto,
  UpdateCompanyResearchNetworkContactsNoteDto,
  UpdateCompanyResearchSourcesDto,
} from './dto/update-company-research-field.dto.js';

/**
 * All identifiers and field values are sent in the request body, never in the
 * URL, so no route below declares a `:param` segment.
 */
@Controller('company-research')
export class CompanyResearchController {
  constructor(
    private readonly companyResearchService: CompanyResearchService,
  ) {}

  // ------------------------------------------------------------------ read

  @Get()
  async getAll() {
    return await this.companyResearchService.findAll();
  }

  @Post('find')
  async getOne(@Body() dto: CompanyResearchIdDto) {
    Logger.log('POST', '/company-research/find');
    return await this.companyResearchService.findOneById(dto.id);
  }

  // ---------------------------------------------------------------- create

  @Post()
  async create(
    @Body() createCompanyResearchDto: CreateCompanyResearchDto,
  ) {
    Logger.log('POST', '/company-research');
    return await this.companyResearchService.createCompanyResearch(
      createCompanyResearchDto,
    );
  }

  // ---------------------------------------------------------------- update

  /** Partial update: `id` selects the row, only the columns sent are changed. */
  @Patch('update')
  async update(
    @Body() updateCompanyResearchDto: UpdateCompanyResearchDto,
  ) {
    Logger.log('PATCH', '/company-research/update');
    return await this.companyResearchService.updateCompanyResearch(
      updateCompanyResearchDto.id,
      updateCompanyResearchDto,
    );
  }

  @Patch('company')
  async updateCompany(
    @Body() updateCompanyResearchDto: UpdateCompanyResearchCompanyDto,
  ) {
    Logger.log('PATCH', '/company-research/company');
    return await this.companyResearchService.updateCompanyResearchCompany(
      updateCompanyResearchDto.id,
      updateCompanyResearchDto.company,
    );
  }

  @Patch('fetched-date')
  async updateFetchedDate(
    @Body() updateCompanyResearchDto: UpdateCompanyResearchFetchedDateDto,
  ) {
    Logger.log('PATCH', '/company-research/fetched-date');
    return await this.companyResearchService.updateCompanyResearchFetchedDate(
      updateCompanyResearchDto.id,
      updateCompanyResearchDto.fetched_date,
    );
  }

  @Patch('sources')
  async updateSources(
    @Body() updateCompanyResearchDto: UpdateCompanyResearchSourcesDto,
  ) {
    Logger.log('PATCH', '/company-research/sources');
    return await this.companyResearchService.updateCompanyResearchSources(
      updateCompanyResearchDto.id,
      updateCompanyResearchDto.sources,
    );
  }

  @Patch('network-contacts-note')
  async updateNetworkContactsNote(
    @Body()
    updateCompanyResearchDto: UpdateCompanyResearchNetworkContactsNoteDto,
  ) {
    Logger.log('PATCH', '/company-research/network-contacts-note');
    return await this.companyResearchService.updateCompanyResearchNetworkContactsNote(
      updateCompanyResearchDto.id,
      updateCompanyResearchDto.network_contacts_note,
    );
  }

  // ---------------------------------------------------------------- delete

  /** Deletes a company research record selected by the id sent in the body. */
  @Delete('delete')
  async remove(@Body() dto: CompanyResearchIdDto) {
    Logger.log('DELETE', '/company-research/delete');
    return await this.companyResearchService.deleteCompanyResearchById(dto.id);
  }
}
