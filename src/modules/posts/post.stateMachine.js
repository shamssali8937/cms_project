const transitions = {
  draft: ['pending', 'published', 'scheduled', 'trash'],
  pending: ['draft', 'published', 'trash'],
  scheduled: ['draft', 'published', 'trash'],
  published: ['draft', 'private', 'trash'],
  private: ['draft', 'published', 'trash'],
  trash: ['draft']
};

export const canTransition = (from, to) => transitions[from]?.includes(to) ?? false;
export const assertValidTransition = (from, to) => {
  if (!canTransition(from, to)) throw new Error(`Invalid transition: ${from} → ${to}`);
};