import { useEffect, useMemo, useState } from 'react';
import MemberCard from './MemberCard.jsx';
import MemberModal from './MemberModal.jsx';

const memberUnits = ['ALL', 'NCT 127', 'NCT DREAM', 'NCT WISH', 'WayV'];

function sortMembers(members, sort) {
  const sortedMembers = sort === 'solo'
    ? members.filter((member) => member.soloAlbums?.length > 0)
    : [...members];

  if (sort === 'az') {
    sortedMembers.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'za') {
    sortedMembers.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sort === 'age') {
    sortedMembers.sort((a, b) => b.age - a.age || a.name.localeCompare(b.name));
  } else if (sort === 'age-asc') {
    sortedMembers.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
  }

  return sortedMembers;
}

export default function MembersView() {
  const [unit, setUnit] = useState('ALL');
  const [sort, setSort] = useState('default');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMembers() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/members?unit=${encodeURIComponent(unit)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Could not load members (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The members response has an invalid format');
        }
        setMembers(data);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Could not load members');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMembers();
    return () => controller.abort();
  }, [unit]);

  const visibleMembers = useMemo(() => sortMembers(members, sort), [members, sort]);

  return (
    <>
      <section id="membersView" className="active" aria-labelledby="membersTitle">
        <div className="members-view-header">
          <h2 className="section-title" id="membersTitle">
            NCT &amp; WayV Members
          </h2>
          <div className="member-view-controls">
            <select
              id="memberSortSelect"
              aria-label="Sort members"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="default">Sort</option>
              <option value="solo">Solo Albums</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
              <option value="age">Age ↓</option>
              <option value="age-asc">Age ↑</option>
            </select>
            <select
              id="memberUnitSelect"
              aria-label="Filter members by unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="ALL">All Members</option>
              {memberUnits.slice(1).map((memberUnit) => (
                <option key={memberUnit} value={memberUnit}>
                  {memberUnit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="member-count" id="memberCount" aria-live="polite">
          {loading && members.length === 0
            ? 'Loading members...'
            : `Showing ${visibleMembers.length} member${visibleMembers.length > 1 ? 's' : ''}`}
        </div>

        {error && <p className="members-error" role="alert">{error}</p>}

        <div className="members-grid" id="membersGrid" aria-live="polite">
          {visibleMembers.length > 0 ? (
            visibleMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => setSelectedMember(member)}
              />
            ))
          ) : (
            !loading && <p className="members-empty">No members found.</p>
          )}
        </div>
      </section>

      <MemberModal
        key={selectedMember?.id ?? 'closed'}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
