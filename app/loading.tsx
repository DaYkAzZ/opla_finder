export default function Loading() {
  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            width: '120px',
            height: '12px',
            borderRadius: '6px',
            backgroundColor: '#EBEBEB',
            marginBottom: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '200px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#EBEBEB',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #2C3035 0%, #26292F 100%)',
          padding: '28px',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '70px',
            height: '24px',
            borderRadius: '100px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '65%',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '45%',
            height: '16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: '72px',
              borderRadius: '16px',
              backgroundColor: '#EBEBEB',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
    </div>
  )
}
