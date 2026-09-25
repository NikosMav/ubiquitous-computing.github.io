// Keep original indices: filtering points first connects the wrong joints.
export function visibleConnections(points, connections, threshold = 0.6) {
  return connections.filter(
    ({ start, end }) =>
      points[start] &&
      points[end] &&
      (points[start].visibility ?? 1) >= threshold &&
      (points[end].visibility ?? 1) >= threshold,
  );
}
export function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}
export function cameraError(error) {
  const messages = {
    NotAllowedError:
      'Δεν δόθηκε πρόσβαση στην κάμερα. Επίτρεψέ την από τις ρυθμίσεις του browser και πάτησε ξανά «Έναρξη κάμερας».',
    NotFoundError: 'Δεν βρέθηκε κάμερα. Σύνδεσε μια κάμερα και δοκίμασε ξανά.',
    NotReadableError:
      'Η κάμερα δεν είναι διαθέσιμη. Κλείσε άλλες εφαρμογές που τη χρησιμοποιούν και δοκίμασε ξανά.',
    OverconstrainedError:
      'Η κάμερα δεν υποστηρίζει τις ζητούμενες ρυθμίσεις. Δοκίμασε άλλη κάμερα ή browser.',
    SecurityError: 'Ο browser δεν επιτρέπει πρόσβαση στην κάμερα σε αυτή τη σελίδα.',
  };
  return (
    messages[error?.name] ??
    'Το πείραμα δεν μπόρεσε να ξεκινήσει ή διακόπηκε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά με ενημερωμένο Chrome ή Safari.'
  );
}
