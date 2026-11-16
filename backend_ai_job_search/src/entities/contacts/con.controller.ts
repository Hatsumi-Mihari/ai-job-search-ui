import { Body, Controller, Delete, Get, Logger, Patch, Post } from '@nestjs/common';
import { ContactService } from './con.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { ContactIdDto } from './dto/contact-id.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import {
    UpdateContactNameDto,
    UpdateContactNoteDto,
    UpdateContactSourceDto,
    UpdateContactStatusDto,
    UpdateContactUrlDto,
} from './dto/update-contact-field.dto.js';

/**
 * All identifiers and field values are sent in the request body, never in the
 * URL, so no route below declares a `:param` segment.
 */
@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    // ------------------------------------------------------------------ read

    @Get()
    async getAll() {
        return await this.contactService.findAll();
    }

    @Post('find')
    async getOne(
        @Body() dto: ContactIdDto,
    ) {
        Logger.log('POST', '/contacts/find');
        return await this.contactService.findOneById(dto.id);
    }

    // ---------------------------------------------------------------- create

    @Post()
    async create(
        @Body() createContactDto: CreateContactDto,
    ) {
        Logger.log('POST', '/contacts');
        return await this.contactService.createContact(createContactDto);
    }

    // ---------------------------------------------------------------- update

    /** Partial update: `id` selects the row, only the columns sent are changed. */
    @Patch('update')
    async update(
        @Body() updateContactDto: UpdateContactDto,
    ) {
        Logger.log('PATCH', '/contacts/update');
        return await this.contactService.updateContact(updateContactDto.id, updateContactDto);
    }

    @Patch('name')
    async updateName(
        @Body() updateContactDto: UpdateContactNameDto,
    ) {
        Logger.log('PATCH', '/contacts/name');
        return await this.contactService.updateContactName(updateContactDto.id, updateContactDto.name);
    }

    @Patch('url')
    async updateUrl(
        @Body() updateContactDto: UpdateContactUrlDto,
    ) {
        Logger.log('PATCH', '/contacts/url');
        return await this.contactService.updateContactUrl(updateContactDto.id, updateContactDto.url);
    }

    @Patch('source')
    async updateSource(
        @Body() updateContactDto: UpdateContactSourceDto,
    ) {
        Logger.log('PATCH', '/contacts/source');
        return await this.contactService.updateContactSource(updateContactDto.id, updateContactDto.source);
    }

    @Patch('note')
    async updateNote(
        @Body() updateContactDto: UpdateContactNoteDto,
    ) {
        Logger.log('PATCH', '/contacts/note');
        return await this.contactService.updateContactNote(updateContactDto.id, updateContactDto.note);
    }

    @Patch('status')
    async updateStatus(
        @Body() updateContactDto: UpdateContactStatusDto,
    ) {
        Logger.log('PATCH', '/contacts/status');
        return await this.contactService.updateContactStatus(updateContactDto.id, updateContactDto.status);
    }

    // ---------------------------------------------------------------- delete

    /** Deletes a contact selected by the id sent in the request body. */
    @Delete('delete')
    async remove(
        @Body() dto: ContactIdDto,
    ) {
        Logger.log('DELETE', '/contacts/delete');
        return await this.contactService.deleteContactById(dto.id);
    }
}
