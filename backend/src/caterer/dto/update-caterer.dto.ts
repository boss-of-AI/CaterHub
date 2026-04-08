import { PartialType } from '@nestjs/mapped-types';
import { CreateCatererDto } from './create-caterer.dto';

export class UpdateCatererDto extends PartialType(CreateCatererDto) { }