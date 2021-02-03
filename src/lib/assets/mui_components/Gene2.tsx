import * as React from 'react'
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

export const Gene2 = (props:SvgIconProps) => {
  const { fill, style } = props
  return (
    <SvgIcon style={style}>
      <g clipPath="url(#clip0)">
        <path d="M18.6842 4.06024C18.7309 4.03075 18.7927 4.04471 18.8221 4.09141L19.9115 5.81675C19.9409 5.86345 19.927 5.92521 19.8803 5.9547L17.5235 7.4427C17.4768 7.47218 17.4628 7.53394 17.4923 7.58064L18.2748 8.82014C18.3224 8.89547 18.2551 8.9907 18.1683 8.97107L14.463 8.13377C14.4091 8.1216 14.3753 8.06806 14.3875 8.01419L15.2248 4.30891C15.2444 4.22201 15.3593 4.20224 15.4069 4.27757L16.1894 5.51707C16.2189 5.56377 16.2807 5.57772 16.3274 5.54824L18.6842 4.06024Z" fill={fill}/>
        <path d="M11.7007 20.9181L11.693 20.9468C11.7345 21.4774 11.8478 21.9666 12.1266 22.4086C12.2101 22.5532 12.3814 22.5991 12.526 22.5156C12.6705 22.4322 12.7164 22.2608 12.633 22.1163C12.4451 21.7908 12.3579 21.4309 12.3068 21.0506L17.8933 17.7767C18.2048 17.9823 18.4652 18.2666 18.6531 18.592C18.7366 18.7365 18.9079 18.7825 19.0525 18.699C19.197 18.6156 19.243 18.4442 19.1595 18.2996C18.8805 17.8583 18.5214 17.4862 18.0747 17.2144L18.0461 17.2067C16.685 16.3525 14.7677 16.2061 13.8582 16.176C14.1097 15.6932 14.4895 14.8466 14.7418 13.9052C15.1164 12.507 15.0649 11.3312 14.5559 10.4918C13.448 8.57498 10.3289 8.35092 9.16853 8.34506C9.60546 7.51461 10.5265 5.55982 10.3188 3.82256L10.3265 3.79388C10.2545 3.37727 10.1545 2.95319 9.91691 2.58368C9.83346 2.43913 9.6621 2.39321 9.51754 2.47667C9.373 2.56012 9.32708 2.73148 9.41053 2.87603C9.55698 3.12969 9.63784 3.39572 9.71174 3.69063L3.97388 7.07612C3.74774 6.89334 3.55798 6.68957 3.41153 6.43591C3.32808 6.29137 3.15672 6.24545 3.01217 6.3289C2.93943 6.3709 2.8963 6.42004 2.87325 6.50609C2.85039 6.59141 2.8637 6.65646 2.90496 6.729C3.11386 7.09083 3.42345 7.41817 3.7559 7.66017L3.78458 7.66785C5.19274 8.68763 7.35392 8.83867 8.29939 8.84685C8.04783 9.32968 7.63191 10.1965 7.37195 11.1667C6.99731 12.5648 7.0488 13.7406 7.55777 14.5801C8.65142 16.4324 11.6707 16.6911 12.8878 16.7114C12.6208 17.2516 12.2203 18.061 11.9755 18.9746C11.7727 19.6226 11.6899 20.2728 11.7007 20.9181L11.7007 20.9181ZM12.3038 20.3766C12.3483 19.869 12.4574 19.3473 12.6026 18.8052L15.7652 16.9315C16.2863 17.0404 16.7996 17.178 17.2832 17.4297L12.3038 20.3766ZM14.8498 16.8085L12.9248 17.9441C13.0969 17.5314 13.2969 17.1262 13.5254 16.7295C13.7695 16.7334 14.2568 16.7418 14.8498 16.8085L14.8498 16.8085ZM12.461 16.1384L13.5178 15.504C13.3763 15.8027 13.2586 16.0155 13.1917 16.1505C13.0051 16.1612 12.7618 16.1575 12.461 16.1384L12.461 16.1384ZM13.8841 14.5932L11.4527 16.0212C10.924 15.9411 10.3458 15.8161 9.79022 15.6065L14.3198 12.967C14.2874 13.2027 14.2473 13.4671 14.1708 13.7524C14.0944 14.0378 13.9892 14.3155 13.8841 14.5932L13.8841 14.5932ZM8.1827 14.5333L14.1455 10.9937C14.297 11.3402 14.3691 11.7568 14.397 12.2231L9.16577 15.3161C8.76059 15.1161 8.43582 14.8454 8.18285 14.5332L8.1827 14.5333ZM7.68282 12.7479L12.8423 9.69695C13.2474 9.89696 13.5722 10.1677 13.8539 10.4875L7.89876 13.9984C7.74649 13.6518 7.67445 13.2351 7.68282 12.7479ZM9.49429 8.95283L8.62609 9.45409C8.74455 9.24146 8.8261 9.0489 8.89301 8.91391C9.04338 8.92346 9.22993 8.91274 9.49428 8.95283L9.49429 8.95283ZM6.77146 8.16176L9.23907 6.71353C8.95511 7.43203 8.64414 8.0219 8.5103 8.29191C8.23771 8.27956 7.56443 8.28282 6.77151 8.16181L6.77146 8.16176ZM9.75117 4.34316C9.74279 4.83044 9.66261 5.35917 9.53273 5.84387L5.93634 7.96879C5.45166 7.83892 4.94524 7.67248 4.51978 7.43629L9.75117 4.34316ZM8.22344 10.386L10.5101 9.04218C11.0388 9.12237 11.6247 9.21866 12.1803 9.42823L7.75217 12.0334C7.78457 11.7977 7.83818 11.5976 7.90696 11.3409C7.99879 10.9982 8.11163 10.6918 8.22352 10.386L8.22344 10.386Z" fill={fill}/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </SvgIcon>
  );
}