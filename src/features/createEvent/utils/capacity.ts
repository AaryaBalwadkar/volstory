import type {
  CreateEventFormData,
  DerivedCapacity,
  SkillGroup,
  TimeSlot,
} from "../types/event.types";

/**
 * Calculates aggregate volunteer capacities and union of skills across an array of SkillGroups.
 *
 * @param {SkillGroup[]} groups - The skill groups to calculate capacities for.
 * @returns {DerivedCapacity} Object containing summed min/max participants and unique skills.
 */
export function deriveSkillGroupCapacity(
  groups: SkillGroup[],
): DerivedCapacity {
  const minParticipants = groups.reduce(
    (total, group) => total + group.minParticipants,
    0,
  );
  const maxParticipants = groups.reduce(
    (total, group) => total + group.maxParticipants,
    0,
  );
  const skills = [...new Set(groups.flatMap((group) => group.skills))];

  return { minParticipants, maxParticipants, skills };
}

/**
 * Derives and fills min/max participants count for a TimeSlot based on its nested SkillGroups.
 * Used to ensure slot capacities are always calculated programmatically from their constituent roles.
 *
 * @param {TimeSlot} slot - The input time slot.
 * @returns {TimeSlot} A new TimeSlot object with correct calculated minParticipants and maxParticipants.
 */
export function withDerivedSlotCapacity(slot: TimeSlot): TimeSlot {
  const derived = deriveSkillGroupCapacity(slot.skillGroups ?? []);
  return {
    ...slot,
    minParticipants: derived.minParticipants,
    maxParticipants: derived.maxParticipants,
    skillGroups: slot.skillGroups ?? [],
  };
}

/**
 * Computes overall event capacity and aggregate requirements from the wizard form input data.
 * If slots exist, aggregates capacities across all slots. Otherwise, aggregates across global skill groups.
 *
 * @param {CreateEventFormData} form - The current wizard form input state.
 * @returns {DerivedCapacity} The overall calculated capacity profile for the event.
 */
export function deriveEventCapacity(
  form: CreateEventFormData,
): DerivedCapacity {
  if (form.slots.length > 0) {
    const derivedSlots = form.slots.map(withDerivedSlotCapacity);
    return {
      minParticipants: derivedSlots.reduce(
        (total, slot) => total + slot.minParticipants,
        0,
      ),
      maxParticipants: derivedSlots.reduce(
        (total, slot) => total + slot.maxParticipants,
        0,
      ),
      skills: [
        ...new Set(
          derivedSlots.flatMap((slot) =>
            slot.skillGroups.flatMap((group) => group.skills),
          ),
        ),
      ],
    };
  }

  return deriveSkillGroupCapacity(form.skillGroups);
}

/**
 * Validates that all slots defined in the form contain complete and valid SkillGroups.
 * A skill group is complete if it has a non-empty title, positive max capacity,
 * min capacity not exceeding max capacity, and at least one designated skill tag.
 *
 * @param {CreateEventFormData} form - The current wizard form input state.
 * @returns {boolean} True if every slot has at least one complete and valid skill group.
 */
export function hasCompleteSlotSkillGroups(form: CreateEventFormData): boolean {
  return (
    form.slots.length > 0 &&
    form.slots.every((slot) => {
      const groups = slot.skillGroups ?? [];
      return (
        groups.length > 0 &&
        groups.every(
          (group) =>
            group.title.trim().length > 0 &&
            group.maxParticipants > 0 &&
            group.minParticipants <= group.maxParticipants &&
            group.skills.length > 0,
        )
      );
    })
  );
}
