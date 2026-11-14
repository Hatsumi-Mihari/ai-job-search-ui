import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactEntity } from './con.entity.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { Measure } from '@/common/services/index.js';

/**
 * Fields that are allowed to be changed after a contact has been created.
 * `id` and `date_add` are managed by the database and must never be edited.
 */
export type UpdateContactPayload = Partial<CreateContactDto>;

/** Result returned by every mutating operation of this service. */
export type ContactMutationResult = {
    success: boolean;
    message: string;
    id?: number;
};

@Injectable()
export class ContactService {
    /** Columns that a client is allowed to write to. */
    private static readonly EDITABLE_FIELDS: ReadonlyArray<keyof UpdateContactPayload> = [
        'name',
        'url',
        'source',
        'note',
        'status',
    ];

    constructor(
        @InjectRepository(ContactEntity)
        private readonly contactRepository: Repository<ContactEntity>,
    ) { }

    // ---------------------------------------------------------------- create

    @Measure('ContactService')
    async createContact(contactDTO: CreateContactDto): Promise<ContactMutationResult> {
        const newContact = this.contactRepository.create(contactDTO);

        Logger.log('createContact', 'ContactService');

        const savedContact = await this.contactRepository.save(newContact);

        return {
            success: true,
            message: 'Contact successfully created',
            id: savedContact.id,
        };
    }

    // ------------------------------------------------------------------ read

    async findAll(): Promise<ContactEntity[]> {
        return await this.contactRepository.find();
    }

    @Measure('ContactService')
    async findOneById(id: number): Promise<ContactEntity> {
        this.assertValidId(id);

        const contact = await this.contactRepository.findOneBy({ id });

        if (!contact) {
            throw new NotFoundException(`Contact with id ${id} not found`);
        }

        return contact;
    }

    // ---------------------------------------------------------------- update

    /**
     * Main update entry point: applies only the fields that are present in the
     * payload, leaving every other column untouched.
     */
    @Measure('ContactService')
    async updateContact(id: number, contactDTO: UpdateContactPayload): Promise<ContactMutationResult> {
        return this.applyUpdate(id, contactDTO);
    }

    @Measure('ContactService')
    async updateContactName(id: number, name: string): Promise<ContactMutationResult> {
        this.assertNonEmptyString(name, 'name');
        this.assertMaxLength(name, 128, 'name');

        return this.applyUpdate(id, { name });
    }

    @Measure('ContactService')
    async updateContactUrl(id: number, url: string): Promise<ContactMutationResult> {
        this.assertString(url, 'url');

        return this.applyUpdate(id, { url });
    }

    @Measure('ContactService')
    async updateContactSource(id: number, source: string): Promise<ContactMutationResult> {
        this.assertNonEmptyString(source, 'source');
        this.assertMaxLength(source, 128, 'source');

        return this.applyUpdate(id, { source });
    }

    @Measure('ContactService')
    async updateContactNote(id: number, note: string): Promise<ContactMutationResult> {
        this.assertString(note, 'note');

        return this.applyUpdate(id, { note });
    }

    @Measure('ContactService')
    async updateContactStatus(id: number, status: string): Promise<ContactMutationResult> {
        this.assertNonEmptyString(status, 'status');
        this.assertMaxLength(status, 64, 'status');

        return this.applyUpdate(id, { status });
    }

    // ---------------------------------------------------------------- delete

    /**
     * Deletes a contact by its primary key. Records can only be removed by id,
     * so no other criteria (name, source, status, ...) is accepted here.
     */
    @Measure('ContactService')
    async deleteContactById(id: number): Promise<{ success: boolean; message: string; id: number }> {
        this.assertValidId(id);

        const contact = await this.contactRepository.findOneBy({ id });

        if (!contact) {
            throw new NotFoundException(`Contact with id ${id} not found`);
        }

        await this.contactRepository.delete({ id });

        Logger.log(`deleteContactById id=${id}`, 'ContactService');

        return {
            success: true,
            message: 'Contact successfully deleted',
            id,
        };
    }

    /** Alias kept short for callers that already use `deleteContact`. */
    async deleteContact(id: number): Promise<{ success: boolean; message: string; id: number }> {
        return this.deleteContactById(id);
    }

    // --------------------------------------------------------------- helpers

    /**
     * Shared update routine: validates the id, ensures the record exists,
     * filters out unknown/undefined fields and persists the merged entity.
     */
    private async applyUpdate(id: number, patch: UpdateContactPayload): Promise<ContactMutationResult> {
        this.assertValidId(id);

        const contact = await this.contactRepository.findOneBy({ id });

        if (!contact) {
            throw new NotFoundException(`Contact with id ${id} not found`);
        }

        const changes: Partial<ContactEntity> = {};
        const writableChanges = changes as Record<string, unknown>;

        for (const field of ContactService.EDITABLE_FIELDS) {
            const value = patch[field];

            // `undefined` keeps the current value, so partial updates stay safe.
            if (value === undefined) {
                continue;
            }

            writableChanges[field] = value;
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestException('No editable fields were provided');
        }

        const merged = this.contactRepository.merge(contact, changes);

        await this.contactRepository.save(merged);

        Logger.log(`updateContact id=${id}`, 'ContactService');

        return {
            success: true,
            message: 'Contact successfully updated',
            id,
        };
    }

    private assertValidId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('Contact id must be a positive integer');
        }
    }

    private assertString(value: string, field: string): void {
        if (typeof value !== 'string') {
            throw new BadRequestException(`${field} must be a string`);
        }
    }

    private assertNonEmptyString(value: string, field: string): void {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new BadRequestException(`${field} must be a non-empty string`);
        }
    }

    private assertMaxLength(value: string, max: number, field: string): void {
        if (typeof value === 'string' && value.length > max) {
            throw new BadRequestException(`${field} must be at most ${max} characters long`);
        }
    }
}
