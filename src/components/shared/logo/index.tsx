type LogoProps = React.ImgHTMLAttributes<HTMLImageElement>

const Logo = (props: LogoProps) => {
  return <img src="/logo.svg" alt="eBuy Logo" {...props} />
}

export default Logo
