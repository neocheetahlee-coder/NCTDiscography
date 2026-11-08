import { useState } from 'react';
import { formatDate, getMemberFlag, getMemberImageSources } from '../utils/memberHelpers.js';

function MemberImage({ member }) {
  const sources = getMemberImageSources(member.image);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex >= sources.length) {
    return (
      <div className="member-photo-placeholder" aria-label={`${member.name} photo unavailable`}>
        <i className="fa-solid fa-user" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={member.name}
      loading="lazy"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  );
}

export default function MemberCard({ member, onClick }) {
  return (
    <div
      className="member-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <MemberImage member={member} />
      <div className="member-card-info">
        <div className="member-name">
          {member.name}
          {member.instagram && (
            <span className="member-instagram-icon" aria-label="Instagram">
              <i className="fa-brands fa-instagram" aria-hidden="true" />
            </span>
          )}
          {member.soloAlbums?.length > 0 && (
            <span className="member-solo-icon" aria-label="Solo albums">
              <i className="fa-brands fa-apple" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="member-birthday">
          🎂 {formatDate(member.birthDate)}
          {getMemberFlag(member) && (
            <span className="member-nationality-flag" role="img" aria-label={`${member.name} flag`}>
              {getMemberFlag(member)}
            </span>
          )}
        </div>
        <div className="member-units">
          {(member.units || []).map((memberUnit) => (
            <span className="member-unit-badge" key={memberUnit}>
              {memberUnit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
