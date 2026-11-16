import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyResearchEntity } from './cr.entity.js';
import { CreateCompanyResearchDto } from './dto/create-company-research.dto.js';
import { CompanySourcesDto } from './dto/company-source.dto.js';
import { Measure } from '@/common/services/index.js';
import {
  normalizeCompanySources,
  normalizeOptionalText,
} from './utils/company-sources.util.js';
import {
  assertMaxLength,
  assertNonEmptyString,
  assertValidCompanyResearchId,
} from './utils/company-research-validation.util.js';

/**
 * Fields that are allowed to be changed after a company research record has
 * been created. `id`, `created_at` and `updated_at` are managed by the
 * database and must never be edited.
 */
export type UpdateCompanyResearchPayload = Partial<CreateCompanyResearchDto>;

/** Result returned by every mutating operation of this service. */
export type CompanyResearchMutationResult = {
  success: boolean;
  message: string;
  id?: string;
};

@Injectable()
export class CompanyResearchService {
  constructor(
    @InjectRepository(CompanyResearchEntity)
    private readonly companyResearchRepository: Repository<CompanyResearchEntity>,
  ) {}

  // ---------------------------------------------------------------- create

  @Measure('CompanyResearchService')
  async createCompanyResearch(
    companyResearchDTO: CreateCompanyResearchDto,
  ): Promise<CompanyResearchMutationResult> {
    assertNonEmptyString(companyResearchDTO.company, 'company');
    assertMaxLength(companyResearchDTO.company, 255, 'company');

    const newCompanyResearch = this.companyResearchRepository.create({
      company: companyResearchDTO.company.trim(),
      fetched_date: companyResearchDTO.fetched_date,
      sources: normalizeCompanySources(companyResearchDTO.sources),
      network_contacts_note: normalizeOptionalText(
        companyResearchDTO.network_contacts_note,
      ),
    });

    Logger.log('createCompanyResearch', 'CompanyResearchService');

    const savedCompanyResearch =
      await this.companyResearchRepository.save(newCompanyResearch);

    return {
      success: true,
      message: 'Company research successfully created',
      id: savedCompanyResearch.id,
    };
  }

  // ------------------------------------------------------------------ read

  async findAll(): Promise<CompanyResearchEntity[]> {
    return await this.companyResearchRepository.find();
  }

  @Measure('CompanyResearchService')
  async findOneById(id: string): Promise<CompanyResearchEntity> {
    assertValidCompanyResearchId(id);

    const companyResearch = await this.companyResearchRepository.findOneBy({
      id,
    });

    if (!companyResearch) {
      throw new NotFoundException(`Company research with id ${id} not found`);
    }

    return companyResearch;
  }

  // ---------------------------------------------------------------- update

  /**
   * Main update entry point: applies only the fields that are present in the
   * payload, leaving every other column untouched.
   */
  @Measure('CompanyResearchService')
  async updateCompanyResearch(
    id: string,
    companyResearchDTO: UpdateCompanyResearchPayload,
  ): Promise<CompanyResearchMutationResult> {
    return this.applyUpdate(id, companyResearchDTO);
  }

  @Measure('CompanyResearchService')
  async updateCompanyResearchCompany(
    id: string,
    company: string,
  ): Promise<CompanyResearchMutationResult> {
    return this.applyUpdate(id, { company });
  }

  @Measure('CompanyResearchService')
  async updateCompanyResearchFetchedDate(
    id: string,
    fetchedDate: string,
  ): Promise<CompanyResearchMutationResult> {
    return this.applyUpdate(id, { fetched_date: fetchedDate });
  }

  @Measure('CompanyResearchService')
  async updateCompanyResearchSources(
    id: string,
    sources: CompanySourcesDto,
  ): Promise<CompanyResearchMutationResult> {
    return this.applyUpdate(id, { sources });
  }

  @Measure('CompanyResearchService')
  async updateCompanyResearchNetworkContactsNote(
    id: string,
    networkContactsNote: string | null,
  ): Promise<CompanyResearchMutationResult> {
    return this.applyUpdate(id, {
      network_contacts_note: networkContactsNote,
    });
  }

  // ---------------------------------------------------------------- delete

  /**
   * Deletes a company research record by its primary key. Records can only be
   * removed by id, so no other criteria (company, fetched_date, ...) is
   * accepted here.
   */
  @Measure('CompanyResearchService')
  async deleteCompanyResearchById(
    id: string,
  ): Promise<{ success: boolean; message: string; id: string }> {
    assertValidCompanyResearchId(id);

    const companyResearch = await this.companyResearchRepository.findOneBy({
      id,
    });

    if (!companyResearch) {
      throw new NotFoundException(`Company research with id ${id} not found`);
    }

    await this.companyResearchRepository.delete({ id });

    Logger.log(
      `deleteCompanyResearchById id=${id}`,
      'CompanyResearchService',
    );

    return {
      success: true,
      message: 'Company research successfully deleted',
      id,
    };
  }

  /** Alias kept short for callers that already use `deleteCompanyResearch`. */
  async deleteCompanyResearch(
    id: string,
  ): Promise<{ success: boolean; message: string; id: string }> {
    return this.deleteCompanyResearchById(id);
  }

  // --------------------------------------------------------------- helpers

  /**
   * Shared update routine: validates the id, ensures the record exists,
   * filters out unknown/undefined fields and persists the merged entity.
   */
  private async applyUpdate(
    id: string,
    patch: UpdateCompanyResearchPayload,
  ): Promise<CompanyResearchMutationResult> {
    assertValidCompanyResearchId(id);

    const companyResearch = await this.companyResearchRepository.findOneBy({
      id,
    });

    if (!companyResearch) {
      throw new NotFoundException(`Company research with id ${id} not found`);
    }

    const changes: Partial<CompanyResearchEntity> = {};

    if (patch.company !== undefined) {
      assertNonEmptyString(patch.company, 'company');
      assertMaxLength(patch.company, 255, 'company');
      changes.company = patch.company.trim();
    }

    if (patch.fetched_date !== undefined) {
      changes.fetched_date = patch.fetched_date;
    }

    if (patch.sources !== undefined) {
      changes.sources = normalizeCompanySources(patch.sources);
    }

    if (patch.network_contacts_note !== undefined) {
      changes.network_contacts_note = normalizeOptionalText(
        patch.network_contacts_note,
      );
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    const merged = this.companyResearchRepository.merge(
      companyResearch,
      changes,
    );

    await this.companyResearchRepository.save(merged);

    Logger.log(
      `updateCompanyResearch id=${id}`,
      'CompanyResearchService',
    );

    return {
      success: true,
      message: 'Company research successfully updated',
      id,
    };
  }
}
